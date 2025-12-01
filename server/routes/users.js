const express = require('express');
const User = require('../models/User');
const { updateProfileValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and search
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skillFilter = req.query.skill || '';
    const skip = (page - 1) * limit;

    // Build search query
    // Note: `isActive` field was removed from the User schema; don't filter by it.
    let query = {};

    // Build combined OR clauses for name/email/studentId and skills
    const orClauses = [];

    if (search) {
      // Match search term against name, studentId, email, AND skills
      orClauses.push(
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skillsOffered: { $regex: search, $options: 'i' } },
        { skillsLookingFor: { $regex: search, $options: 'i' } }
      );
    }

    if (skillFilter) {
      // skillFilter should match any element in the skills arrays
      orClauses.push(
        { skillsOffered: { $regex: skillFilter, $options: 'i' } },
        { skillsLookingFor: { $regex: skillFilter, $options: 'i' } }
      );
    }

    if (orClauses.length > 0) {
      query.$or = orClauses;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ reputation: -1, averageRating: -1 })
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
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put('/:id', updateProfileValidation, handleValidationErrors, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, skillsOffered, skillsLookingFor, bio } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsLookingFor) user.skillsLookingFor = skillsLookingFor;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        skillsOffered: user.skillsOffered,
        skillsLookingFor: user.skillsLookingFor,
        bio: user.bio,
        reputation: user.reputation,
        averageRating: user.averageRating
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/skills/popular
// @desc    Get popular skills
// @access  Private
router.get('/skills/popular', async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ];

    const popularSkills = await User.aggregate(pipeline);

    res.json({ popularSkills });

  } catch (error) {
    console.error('Get popular skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/skills/search
// @desc    Search users by skills
// @access  Private
router.get('/skills/search', async (req, res) => {
  try {
    const { skill, type = 'offered' } = req.query;
    
    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const field = type === 'offered' ? 'skillsOffered' : 'skillsLookingFor';
    const query = { 
      [field]: { $regex: skill, $options: 'i' }
    };

    const users = await User.find(query)
      .select('-password')
      .sort({ reputation: -1, averageRating: -1 })
      .limit(20);

    res.json({ users });

  } catch (error) {
    console.error('Search users by skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
