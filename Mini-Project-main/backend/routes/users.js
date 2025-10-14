const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const {
  validateId,
  validatePagination,
  sanitizeInput
} = require('../middleware/validation');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, sanitizeInput, async (req, res) => {
  try {
    const { name, address, preferences, aadhaarNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (address) user.address = address;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (aadhaarNumber) user.aadhaarNumber = aadhaarNumber;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', protect, async (req, res) => {
  try {
    // In a real application, you would handle file upload here
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Avatar upload endpoint - implement file upload logic'
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Grievance = require('../models/Grievance');

    // Get user's application count by status
    const applicationStats = await Application.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user's grievance count by status
    const grievanceStats = await Grievance.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total counts
    const totalApplications = await Application.countDocuments({ user: req.user._id });
    const totalGrievances = await Grievance.countDocuments({ user: req.user._id });

    // Get pending counts
    const pendingApplications = await Application.countDocuments({
      user: req.user._id,
      status: { $in: ['submitted', 'under_review'] }
    });

    const openGrievances = await Grievance.countDocuments({
      user: req.user._id,
      status: { $in: ['open', 'in_progress'] }
    });

    res.json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          statusBreakdown: applicationStats
        },
        grievances: {
          total: totalGrievances,
          open: openGrievances,
          statusBreakdown: grievanceStats
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Application = require('../models/Application');
    const Grievance = require('../models/Grievance');

    // Get recent applications and grievances
    const [applications, grievances] = await Promise.all([
      Application.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('applicationId title type status createdAt'),
      
      Grievance.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('grievanceId title category status createdAt')
    ]);

    // Combine and sort by date
    const activities = [
      ...applications.map(app => ({
        type: 'application',
        id: app.applicationId,
        title: app.title,
        status: app.status,
        date: app.createdAt
      })),
      ...grievances.map(grievance => ({
        type: 'grievance',
        id: grievance.grievanceId,
        title: grievance.title,
        status: grievance.status,
        date: grievance.createdAt
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        activities: activities.slice(skip, skip + limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(activities.length / limit),
          totalItems: activities.length,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, sanitizeInput, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, sanitizeInput, async (req, res) => {
  try {
    const { email, sms } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification preferences
    if (email !== undefined) {
      user.preferences.notifications.email = email;
    }
    if (sms !== undefined) {
      user.preferences.notifications.sms = sms;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin/Staff)
router.get('/:id', protect, authorize('admin', 'staff'), validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -verificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user's applications (Admin view)
// @route   GET /api/users/:id/applications
// @access  Private (Admin/Staff)
router.get('/:id/applications', protect, authorize('admin', 'staff'), validateId, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Application = require('../models/Application');

    const applications = await Application.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email phone');

    const total = await Application.countDocuments({ user: req.params.id });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get user's grievances (Admin view)
// @route   GET /api/users/:id/grievances
// @access  Private (Admin/Staff)
router.get('/:id/grievances', protect, authorize('admin', 'staff'), validateId, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Grievance = require('../models/Grievance');

    const grievances = await Grievance.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email phone');

    const total = await Grievance.countDocuments({ user: req.params.id });

    res.json({
      success: true,
      data: {
        grievances,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get user grievances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user grievances',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
