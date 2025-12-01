const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/chat/:friendId
// @desc    Get chat history with a friend
// @access  Private
router.get('/:friendId', async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    // Verify friendship exists
    const FriendRequest = require('../models/FriendRequest');
    const friendship = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: friendId, status: 'accepted' },
        { sender: friendId, receiver: userId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId] }
    })
    .populate('messages.sender', 'name email')
    .populate('participants', 'name email');

    if (!chat) {
      // Create new chat if it doesn't exist
      chat = new Chat({
        participants: [userId, friendId]
      });
      await chat.save();
      
      // Update friendship with chat reference
      friendship.chat = chat._id;
      await friendship.save();
    }

    // Mark messages as read for current user
    await chat.markAsRead(userId);

    res.json({ chat });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/conversations/list
// @desc    Get list of all conversations
// @access  Private
router.get('/conversations/list', async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email studentId')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.timestamp': -1 });

    // Format conversations with friend info and unread count
    const conversations = chats.map(chat => {
      const friend = chat.participants.find(p => p._id.toString() !== userId.toString());
      const unreadCount = chat.getUnreadCount(userId);
      
      return {
        chatId: chat._id,
        friend: {
          id: friend._id,
          name: friend.name,
          email: friend.email,
          studentId: friend.studentId
        },
        lastMessage: chat.lastMessage,
        unreadCount,
        updatedAt: chat.updatedAt
      };
    });

    res.json({ conversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/message
// @desc    Send a message (handled by Socket.io, this is for backup)
// @access  Private
router.post('/message', async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Content and receiver ID are required' });
    }

    // Verify friendship
    const FriendRequest = require('../models/FriendRequest');
    const friendship = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: 'accepted' },
        { sender: receiverId, receiver: senderId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId]
      });
      await chat.save();
    }

    // Add message to chat
    await chat.addMessage(senderId, content, messageType);

    // Populate sender info
    await chat.populate('messages.sender', 'name email');

    const newMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      message: 'Message sent successfully',
      newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await chat.markAsRead(userId);

    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/chat/:chatId
// @desc    Delete chat (soft delete)
// @access  Private
router.delete('/:chatId', async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete
    chat.isActive = false;
    await chat.save();

    res.json({ message: 'Chat deleted successfully' });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
