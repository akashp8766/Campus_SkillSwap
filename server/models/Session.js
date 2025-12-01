const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  endedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedbackGiven: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback'
    },
    givenAt: {
      type: Date,
      default: Date.now
    }
  }],
  sessionNumber: {
    type: Number,
    default: 1
  },
  isFirstSession: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Get session count between two users
sessionSchema.statics.getSessionCount = async function(userId1, userId2) {
  const count = await this.countDocuments({
    participants: { $all: [userId1, userId2] },
    status: 'completed'
  });
  return count;
};

// Check if user can start new session (max 5 sessions)
sessionSchema.statics.canStartSession = async function(userId1, userId2) {
  const count = await this.getSessionCount(userId1, userId2);
  return count < 5;
};

// Get active session between two users
sessionSchema.statics.getActiveSession = async function(userId1, userId2) {
  return await this.findOne({
    participants: { $all: [userId1, userId2] },
    status: 'active'
  }).populate('participants', 'name email studentId');
};

// End session and calculate duration
sessionSchema.methods.endSession = function(endedByUserId) {
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000); // Duration in seconds
  this.status = 'completed';
  this.endedBy = endedByUserId;
  this.updatedAt = new Date();
  return this.save();
};

// Index for efficient queries
sessionSchema.index({ participants: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ chat: 1 });

module.exports = mongoose.model('Session', sessionSchema);
