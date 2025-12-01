const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { feedbackValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback for a skill swap
// @access  Private
router.post('/', feedbackValidation, handleValidationErrors, async (req, res) => {
  try {
    const { revieweeId, rating, comment, skillCategory, sessionType } = req.body;
    const reviewerId = req.user._id;

    console.log('📝 Feedback submission received:');
    console.log('   ReviewerId:', reviewerId);
    console.log('   RevieweeId:', revieweeId);
    console.log('   Rating:', rating);
    console.log('   RevieweeId type:', typeof revieweeId);

    // Check if trying to review self
    if (reviewerId.toString() === revieweeId) {
      return res.status(400).json({ message: 'Cannot provide feedback to yourself' });
    }

    // Check if reviewee exists
    const reviewee = await User.findById(revieweeId);
    console.log('   Reviewee found:', reviewee ? 'Yes' : 'No');
    if (reviewee) {
      console.log('   Reviewee name:', reviewee.name);
      console.log('   Reviewee email:', reviewee.email);
      console.log('   Reviewee isActive:', reviewee.isActive);
    }
    
    if (!reviewee) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active (allow undefined isActive as active)
    if (reviewee.isActive === false) {
      console.log('❌ User is inactive');
      return res.status(404).json({ message: 'User is not active' });
    }

    // Create feedback
    const feedback = new Feedback({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment: comment || '',
      skillCategory,
      sessionType: sessionType || 'skill-share'
    });

    await feedback.save();

    // Update reviewee's rating statistics
    await updateUserRatingStats(revieweeId);

    // Populate reviewer info
    await feedback.populate('reviewer', 'name email studentId');

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('❌ Submit feedback error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/feedback/:userId
// @desc    Get feedback for a specific user
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { skillCategory, limit = 10, page = 1 } = req.query;

    console.log('📥 Get feedback request for userId:', userId);
    console.log('   Query params:', { skillCategory, limit, page });

    // Check if user exists
    const user = await User.findById(userId);
    console.log('   User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active (allow undefined isActive as active)
    if (user.isActive === false) {
      console.log('❌ User is inactive');
      return res.status(404).json({ message: 'User is not active' });
    }

    // Build query
    let query = { reviewee: userId };
    if (skillCategory) {
      query.skillCategory = { $regex: skillCategory, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    console.log('   Fetching feedback with query:', query);
    const feedback = await Feedback.find(query)
      .populate('reviewer', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);
    console.log('   Found', feedback.length, 'feedbacks, total:', total);

    // Get feedback summary
    console.log('   Getting feedback summary...');
    const summary = await Feedback.getFeedbackSummary(userId);
    console.log('   Summary retrieved successfully');

    res.json({
      feedback,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

    console.log('✅ Feedback data sent successfully');

  } catch (error) {
    console.error('❌ Get feedback error:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/feedback/user/:userId/summary
// @desc    Get feedback summary for a user
// @access  Private
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('📊 Get feedback summary for userId:', userId);

    const user = await User.findById(userId);
    console.log('   User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active (allow undefined isActive as active)
    if (user.isActive === false) {
      console.log('❌ User is inactive');
      return res.status(404).json({ message: 'User is not active' });
    }

    console.log('   Getting feedback summary...');
    const summary = await Feedback.getFeedbackSummary(userId);
    console.log('   Getting rating stats...');
    const ratingStats = await Feedback.getAverageRating(userId);
    console.log('✅ Summary data retrieved successfully');

    res.json({
      summary,
      ratingStats,
      userStats: {
        reputation: user.reputation,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings
      }
    });

  } catch (error) {
    console.error('❌ Get feedback summary error:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/feedback/:feedbackId
// @desc    Update feedback (only by reviewer)
// @access  Private
router.put('/:feedbackId', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const feedbackId = req.params.feedbackId;

    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is the reviewer
    if (feedback.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update feedback
    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    
    await feedback.save();

    // Update reviewee's rating statistics
    await updateUserRatingStats(feedback.reviewee);

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/feedback/:feedbackId
// @desc    Delete feedback (only by reviewer)
// @access  Private
router.delete('/:feedbackId', async (req, res) => {
  try {
    const userId = req.user._id;
    const feedbackId = req.params.feedbackId;

    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is the reviewer
    if (feedback.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const revieweeId = feedback.reviewee;
    await Feedback.findByIdAndDelete(feedbackId);

    // Update reviewee's rating statistics
    await updateUserRatingStats(revieweeId);

    res.json({ message: 'Feedback deleted successfully' });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user rating statistics
async function updateUserRatingStats(userId) {
  try {
    const stats = await Feedback.getAverageRating(userId);
    
    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalRatings: stats.totalRatings,
      reputation: Math.round(stats.averageRating * stats.totalRatings)
    });
  } catch (error) {
    console.error('Error updating user rating stats:', error);
  }
}

module.exports = router;
