const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const FriendRequest = require('../models/FriendRequest');
const Chat = require('../models/Chat');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get feedback statistics
    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Get friend request statistics
    const totalFriendRequests = await FriendRequest.countDocuments();
    const pendingFriendRequests = await FriendRequest.countDocuments({ status: 'pending' });

    // Get chat statistics
    const totalChats = await Chat.countDocuments({ isActive: true });
    const totalMessages = await Chat.aggregate([
      { $unwind: '$messages' },
      { $count: 'totalMessages' }
    ]);

    // Get low-rated users (average rating < 2.0)
    const lowRatedUsers = await User.find({
      averageRating: { $lt: 2.0 },
      totalRatings: { $gte: 3 } // Only users with at least 3 ratings
    }).select('name email studentId averageRating totalRatings');

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth
        },
        feedback: {
          total: totalFeedback,
          averageRating: averageRating.length > 0 ? Math.round(averageRating[0].avgRating * 10) / 10 : 0
        },
        friendRequests: {
          total: totalFriendRequests,
          pending: pendingFriendRequests
        },
        chats: {
          total: totalChats,
          totalMessages: totalMessages.length > 0 ? totalMessages[0].totalMessages : 0
        }
      },
      lowRatedUsers
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with admin details
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user and all related data
// @access  Private (Admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting other admins
    if (user.isAdmin && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete other admin users' });
    }

    // Delete related data
    await Promise.all([
      Feedback.deleteMany({ $or: [{ reviewer: userId }, { reviewee: userId }] }),
      FriendRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
      Chat.deleteMany({ participants: userId })
    ]);

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all related data deleted successfully' });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/feedback
// @desc    Get all feedback with admin details
// @access  Private (Admin only)
router.get('/feedback', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find()
      .populate('reviewer', 'name email studentId')
      .populate('reviewee', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.json({
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/feedback/:feedbackId
// @desc    Delete inappropriate feedback
// @access  Private (Admin only)
router.delete('/feedback/:feedbackId', async (req, res) => {
  try {
    const feedbackId = req.params.feedbackId;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    // Update user rating statistics
    const stats = await Feedback.getAverageRating(feedback.reviewee);
    await User.findByIdAndUpdate(feedback.reviewee, {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalRatings: stats.totalRatings,
      reputation: Math.round(stats.averageRating * stats.totalRatings)
    });

    res.json({ message: 'Feedback deleted successfully' });

  } catch (error) {
    console.error('Admin delete feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/users
// @desc    Generate user activity report
// @access  Private (Admin only)
router.get('/reports/users', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const report = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ report });

  } catch (error) {
    console.error('Admin user report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/activity
// @desc    Generate platform activity report
// @access  Private (Admin only)
router.get('/reports/activity', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const activityReport = await Promise.all([
      // New users
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // New friend requests
      FriendRequest.countDocuments({ createdAt: { $gte: startDate } }),
      
      // New feedback
      Feedback.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Active chats
      Chat.countDocuments({ 
        'lastMessage.timestamp': { $gte: startDate }
      })
    ]);

    res.json({
      period: `${days} days`,
      activity: {
        newUsers: activityReport[0],
        newFriendRequests: activityReport[1],
        newFeedback: activityReport[2],
        activeChats: activityReport[3]
      }
    });

  } catch (error) {
    console.error('Admin activity report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
