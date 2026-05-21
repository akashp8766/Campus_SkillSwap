const express = require('express');
const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { friendRequestValidation, handleValidationErrors } = require('../middleware/validation');
const { verifyFriendship } = require('../utils/friendship');

const router = express.Router();

// Helper function to emit notification
const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }
};

// @route   GET /api/friends
// @desc    Get user's friends list
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get accepted friend requests where user is either sender or receiver
    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    })
    .populate('sender', 'name email studentId skillsOffered averageRating')
    .populate('receiver', 'name email studentId skillsOffered averageRating')
    .sort({ respondedAt: -1 })
    .lean();

    // Extract friends (excluding the current user)
    const friends = friendRequests.map(request => {
      const friend = request.sender._id.toString() === userId.toString() 
        ? request.receiver 
        : request.sender;
      return {
        ...friend,
        friendshipDate: request.respondedAt
      };
    });

    res.json({ friends });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', friendRequestValidation, handleValidationErrors, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Check if trying to send request to self
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const existingFriendship = await verifyFriendship(senderId, receiverId);

    if (existingFriendship) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already exists (any status)
    let friendRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (friendRequest) {
      // If request exists but is declined or was removed, update it to pending
      if (friendRequest.status === 'declined' || friendRequest.status === 'removed') {
        friendRequest.sender = senderId;
        friendRequest.receiver = receiverId;
        friendRequest.status = 'pending';
        friendRequest.message = message || '';
        friendRequest.createdAt = new Date();
        friendRequest.respondedAt = null;
        
        await friendRequest.save();
        await friendRequest.populate('sender', 'name email studentId');
        
        // Emit notification to receiver
        const io = req.app.get('io');
        emitNotification(io, receiverId, {
          type: 'friend_request',
          message: `${req.user.name} sent you a friend request`,
          senderId: senderId.toString(),
          senderName: req.user.name,
          timestamp: new Date().toISOString()
        });
        
        return res.status(201).json({
          message: 'Friend request sent successfully',
          friendRequest
        });
      } else if (friendRequest.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
    }

    // Create new friend request
    friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      message: message || ''
    });

    await friendRequest.save();

    // Populate sender info for response
    await friendRequest.populate('sender', 'name email studentId');

    // Emit notification to receiver
    const io = req.app.get('io');
    emitNotification(io, receiverId, {
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request`,
      senderId: senderId.toString(),
      senderName: req.user.name,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendRequest
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/requests
// @desc    Get pending friend requests
// @access  Private
router.get('/requests', async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    })
    .populate('sender', 'name email studentId skillsOffered averageRating')
    .sort({ createdAt: -1 })
    .lean();

    res.json({ requests });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/friends/request/:id
// @desc    Accept or decline friend request
// @access  Private
router.put('/request/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user._id;
    const requestId = req.params.id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "decline"' });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the receiver
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already processed' });
    }

    // Update request status
    friendRequest.status = action === 'accept' ? 'accepted' : 'declined';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    // If accepted, create a chat between the users
    if (action === 'accept') {
      try {
        const chat = new Chat({
          participants: [friendRequest.sender, friendRequest.receiver]
        });
        await chat.save();
        
        // Update friend request with chat reference
        friendRequest.chat = chat._id;
        await friendRequest.save();

        // Emit notification to sender
        const io = req.app.get('io');
        emitNotification(io, friendRequest.sender, {
          type: 'friend_accepted',
          message: `${req.user.name} accepted your friend request`,
          friendId: userId.toString(),
          friendName: req.user.name,
          timestamp: new Date().toISOString()
        });
      } catch (chatError) {
        console.error('Error creating chat:', chatError);
        // Don't fail the request if chat creation fails
      }
    }

    // Populate sender info for response
    await friendRequest.populate('sender', 'name email studentId');

    res.json({
      message: `Friend request ${action}ed successfully`,
      friendRequest
    });

  } catch (error) {
    console.error('Process friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/friends/:friendId
// @desc    Remove friend
// @access  Private
router.delete('/:friendId', async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    // Validate friendId
    if (!friendId || friendId === 'undefined' || friendId === 'null') {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      console.error('Invalid ObjectId format:', friendId);
      return res.status(400).json({ message: 'Invalid friend ID format' });
    }

    // Convert to ObjectId
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    // Find the friendship
    const friendship = await verifyFriendship(userId, friendObjectId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Update status to removed (allows re-sending friend request later)
    friendship.status = 'removed';
    friendship.respondedAt = new Date();
    await friendship.save();

    // Delete the chat between these users
    try {
      await Chat.deleteOne({
        participants: { $all: [userId, friendObjectId] }
      });
    } catch (chatError) {
      console.error('Error deleting chat:', chatError);
      // Don't fail the request if chat deletion fails
    }

    // Emit notification to the friend
    const io = req.app.get('io');
    emitNotification(io, friendObjectId, {
      type: 'friend_removed',
      message: `${req.user.name} removed you as a friend`,
      friendId: userId.toString(),
      friendName: req.user.name,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Friend removed successfully' });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/friends/suggestions
// @desc    Get friend suggestions based on skills
// @access  Private
router.get('/suggestions', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('skillsOffered skillsLookingFor')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Get IDs of existing friends/requests to exclude them from suggestions
    const existingRequests = await FriendRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .select('sender receiver')
      .lean();
    
    const friendIds = existingRequests.flatMap(req => 
      [req.sender.toString(), req.receiver.toString()]
    );
    friendIds.push(userId.toString());

    // 2. Query for suggestions (pushing filtering to MongoDB prevents returning empty sets)
    const suggestions = await User.find({
      _id: { $nin: friendIds },
      $or: [
        { skillsOffered: { $in: user.skillsLookingFor } },
        { skillsLookingFor: { $in: user.skillsOffered } }
      ]
    })
    .select('-password')
    .limit(10)
    .sort({ reputation: -1, averageRating: -1 })
    .lean();

    res.json({ suggestions });

  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
