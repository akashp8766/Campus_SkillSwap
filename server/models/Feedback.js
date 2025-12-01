const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  skillCategory: {
    type: String,
    required: true,
    trim: true
  },
  sessionType: {
    type: String,
    enum: ['skill-share', 'tutoring', 'collaboration', 'other'],
    default: 'skill-share'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
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

// Prevent self-feedback
feedbackSchema.pre('save', function(next) {
  if (this.reviewer.toString() === this.reviewee.toString()) {
    const error = new Error('Cannot provide feedback to yourself');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Update timestamp on modification
feedbackSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Static method to get average rating for a user
feedbackSchema.statics.getAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalRatings: 0 };
};

// Static method to get feedback summary for a user
feedbackSchema.statics.getFeedbackSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$skillCategory',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
        ratings: { $push: '$rating' }
      }
    },
    {
      $project: {
        skillCategory: '$_id',
        averageRating: { $round: ['$averageRating', 1] },
        count: 1,
        ratings: 1,
        _id: 0
      }
    },
    { $sort: { averageRating: -1 } }
  ]);
  
  return summary;
};

module.exports = mongoose.model('Feedback', feedbackSchema);
