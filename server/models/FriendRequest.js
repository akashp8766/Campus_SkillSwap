const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'removed'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  }
});

// Ensure one pending request per sender-receiver pair
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Prevent duplicate friend requests
friendRequestSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'pending') {
    const existingRequest = await this.constructor.findOne({
      $or: [
        { sender: this.sender, receiver: this.receiver, status: 'pending' },
        { sender: this.receiver, receiver: this.sender, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      const error = new Error('Friend request already exists');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Update respondedAt when status changes
friendRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.respondedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
