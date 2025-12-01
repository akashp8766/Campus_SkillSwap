const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const sessionRoutes = require('./routes/session');

// Import middleware
const { auth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-skill-swap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/friends', auth, friendRoutes);
app.use('/api/chat', auth, chatRoutes);
app.use('/api/feedback', auth, feedbackRoutes);
app.use('/api/session', auth, sessionRoutes);
app.use('/api/admin', auth, adminRoutes);

// Socket.io connection handling
const connectedUsers = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined their room`);
  });

  // Handle private messages
  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, message, timestamp } = data;
      
      console.log(`📨 Message from ${senderId} to ${receiverId}: ${message}`);
      
      // Save message to database
      const Chat = require('./models/Chat');
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: []
        });
      }

      // Add message (addMessage method calls save internally)
      await chat.addMessage(senderId, message, 'text');

      // Populate sender info for the new message
      await chat.populate('messages.sender', 'name email');
      const newMessage = chat.messages[chat.messages.length - 1];

      // Emit to receiver
      console.log(`📤 Emitting message to receiver ${receiverId}`);
      io.to(receiverId).emit('receiveMessage', {
        senderId,
        sender: newMessage.sender,
        content: message,
        message,
        timestamp: newMessage.timestamp,
        isRead: false
      });

      // Send notification to receiver
      const User = require('./models/User');
      const sender = await User.findById(senderId);
      
      console.log(`🔔 Sending notification to ${receiverId}`);
      io.to(receiverId).emit('notification', {
        type: 'message',
        message: `New message from ${sender.name}`,
        senderId: senderId,
        senderName: sender.name,
        timestamp: new Date().toISOString()
      });
      
      // Confirm message sent to sender
      socket.emit('messageSent', { 
        success: true,
        message: newMessage 
      });
      
      console.log(`✅ Message sent successfully`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('userTyping', {
      senderId: data.senderId,
      isTyping: data.isTyping
    });
  });

  // Handle session end - immediate for initiator, notification for receiver
  socket.on('endSession', (data) => {
    const { sessionId, initiatorId, initiatorName, receiverId, receiverName } = data;
    console.log(`🛑 Session ended by ${initiatorName} (${initiatorId})`);
    
    // Notify receiver that session ended and they can optionally give feedback
    io.to(receiverId).emit('sessionEndedNotification', {
      sessionId,
      endedBy: {
        id: initiatorId,
        name: initiatorName
      },
      receiverName,
      message: `${initiatorName} has ended the session. You can provide feedback.`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Notified ${receiverName} (${receiverId}) about session end`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, connectedUsers };
