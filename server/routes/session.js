const express = require('express');
const Session = require('../models/Session');
const Chat = require('../models/Chat');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

const router = express.Router();

// @route   POST /api/session/start
// @desc    Start a new session
// @access  Private
router.post('/start', async (req, res) => {
  try {
    const { friendId, chatId } = req.body;
    const userId = req.user._id;

    // Verify friendship
    const friendship = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: friendId, status: 'accepted' },
        { sender: friendId, receiver: userId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    // Check if there's already an active session
    const activeSession = await Session.getActiveSession(userId, friendId);
    if (activeSession) {
      return res.status(400).json({ 
        message: 'Session already active',
        session: activeSession
      });
    }

    // Check session count (max 5)
    const canStart = await Session.canStartSession(userId, friendId);
    if (!canStart) {
      return res.status(400).json({ 
        message: 'Maximum session limit (5) reached with this user'
      });
    }

    // Get session count for session number
    const sessionCount = await Session.getSessionCount(userId, friendId);
    const isFirstSession = sessionCount === 0;

    // Create new session
    const session = new Session({
      participants: [userId, friendId],
      chat: chatId,
      startedBy: userId,
      startTime: new Date(),
      sessionNumber: sessionCount + 1,
      isFirstSession,
      status: 'active'
    });

    await session.save();
    await session.populate('participants', 'name email studentId');

    // Emit socket event to friend
    const io = req.app.get('io');
    io.to(friendId.toString()).emit('sessionStarted', {
      session,
      startedBy: {
        id: userId,
        name: req.user.name
      },
      message: `${req.user.name} started a skill-sharing session`
    });

    res.status(201).json({
      message: 'Session started successfully',
      session
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/active/:friendId
// @desc    Get active session with a friend
// @access  Private
router.get('/active/:friendId', async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    const session = await Session.getActiveSession(userId, friendId);
    
    if (!session) {
      return res.status(404).json({ message: 'No active session' });
    }

    res.json({ session });

  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/count/:friendId
// @desc    Get session count with a friend
// @access  Private
router.get('/count/:friendId', async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    const count = await Session.getSessionCount(userId, friendId);
    const canStart = await Session.canStartSession(userId, friendId);

    res.json({ 
      sessionCount: count,
      canStartNewSession: canStart,
      maxSessions: 5
    });

  } catch (error) {
    console.error('Get session count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/session/:sessionId/end
// @desc    End a session
// @access  Private
router.post('/:sessionId/end', async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.sessionId;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is a participant
    if (!session.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if session is already ended
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session already ended' });
    }

    // End the session
    await session.endSession(userId);
    await session.populate('participants', 'name email studentId');

    // Get the other participant
    const otherParticipant = session.participants.find(
      p => p._id.toString() !== userId.toString()
    );

    // Emit socket event to other participant
    const io = req.app.get('io');
    
    // Notify other participant that session ended
    io.to(otherParticipant._id.toString()).emit('sessionEnded', {
      session,
      endedBy: {
        id: userId,
        name: req.user.name
      },
      message: `${req.user.name} ended the session`
    });

    // Send notification to other participant to submit feedback
    io.to(otherParticipant._id.toString()).emit('notification', {
      type: 'session_feedback',
      message: `${req.user.name} ended the session. Please submit your feedback!`,
      senderId: userId,
      senderName: req.user.name,
      sessionId: session._id,
      timestamp: new Date()
    });

    res.json({
      message: 'Session ended successfully',
      session,
      duration: session.duration
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/session/:sessionId/feedback
// @desc    Mark feedback as given for a session
// @access  Private
router.post('/:sessionId/feedback', async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.sessionId;
    const { feedbackId } = req.body;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is a participant
    if (!session.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if feedback already given
    const alreadyGiven = session.feedbackGiven.some(
      f => f.user.toString() === userId.toString()
    );

    if (alreadyGiven) {
      return res.status(400).json({ message: 'Feedback already submitted for this session' });
    }

    // Add feedback to session
    session.feedbackGiven.push({
      user: userId,
      feedback: feedbackId,
      givenAt: new Date()
    });

    await session.save();

    res.json({
      message: 'Feedback recorded successfully',
      session
    });

  } catch (error) {
    console.error('Record session feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/session/history/:friendId
// @desc    Get session history with a friend
// @access  Private
router.get('/history/:friendId', async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    const sessions = await Session.find({
      participants: { $all: [userId, friendId] },
      status: 'completed'
    })
    .populate('participants', 'name email studentId')
    .populate('feedbackGiven.feedback')
    .sort({ createdAt: -1 });

    res.json({ sessions });

  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/session/request
// @desc    Request a new session (after first one)
// @access  Private
router.post('/request', async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // Check session count
    const sessionCount = await Session.getSessionCount(userId, friendId);
    
    if (sessionCount === 0) {
      return res.status(400).json({ 
        message: 'First session does not require a request. Just start messaging.' 
      });
    }

    if (sessionCount >= 5) {
      return res.status(400).json({ 
        message: 'Maximum session limit (5) reached with this user'
      });
    }

    // Get friend info
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send notification to friend
    const io = req.app.get('io');
    io.to(friendId.toString()).emit('notification', {
      type: 'session_request',
      message: `${req.user.name} wants to start a new skill-sharing session`,
      senderId: userId,
      senderName: req.user.name,
      timestamp: new Date()
    });

    res.json({
      message: 'Session request sent successfully'
    });

  } catch (error) {
    console.error('Request session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
