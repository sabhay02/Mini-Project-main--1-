import express from 'express';
const router = express.Router();
import Grievance from '../models/Grievance.js';
import User from '../models/User.js';
import { protect, authorize, checkResourceAccess } from '../middleware/auth.js';
import {
  validateGrievanceSubmission,
  validateId,
  validatePagination,
  validateStatusUpdate,
  sanitizeInput
} from '../middleware/validation.js';

// @desc    Get user's grievances
// @route   GET /api/grievances
// @access  Private (Citizen only)
router.get('/', protect, authorize('citizen'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const grievances = await Grievance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email phone')
      .select('-timeline');

    const total = await Grievance.countDocuments(query);

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
    console.error('Get grievances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievances',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private (Citizen only)
router.get('/:id', protect, authorize('citizen'), validateId, checkResourceAccess('grievance'), async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('timeline.updatedBy', 'name email');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    res.json({
      success: true,
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Get grievance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Submit new grievance
// @route   POST /api/grievances
// @access  Private (Citizen only)
router.post('/', protect, authorize('citizen'), sanitizeInput, validateGrievanceSubmission, async (req, res) => {
  try {
    const grievanceData = {
      ...req.body,
      user: req.user._id,
      status: 'open'
    };

    const grievance = await Grievance.create(grievanceData);

    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Submit grievance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit grievance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update grievance
// @route   PUT /api/grievances/:id
// @access  Private
router.put('/:id', protect, validateId, checkResourceAccess('grievance'), sanitizeInput, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // Don't allow updates to resolved/closed grievances
    if (['resolved', 'closed'].includes(grievance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update resolved grievance'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title',
      'description',
      'location',
      'attachments',
      'priority'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        grievance[field] = req.body[field];
      }
    });

    await grievance.save();

    res.json({
      success: true,
      message: 'Grievance updated successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Update grievance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grievance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete grievance (only open grievances)
// @route   DELETE /api/grievances/:id
// @access  Private
router.delete('/:id', protect, validateId, checkResourceAccess('grievance'), async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // Only allow deletion of open grievances
    if (grievance.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete processed grievance'
      });
    }

    await Grievance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Grievance deleted successfully'
    });
  } catch (error) {
    console.error('Delete grievance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grievance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add timeline update (Admin/Staff only)
// @route   POST /api/grievances/:id/timeline
// @access  Private (Admin/Staff)
router.post('/:id/timeline', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { status, comment, attachments = [] } = req.body;

    if (!status || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Status and comment are required'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.addTimelineUpdate(status, comment, req.user._id, attachments);
    await grievance.save();

    res.json({
      success: true,
      message: 'Timeline updated successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Add timeline update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add timeline update',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Set resolution (Admin/Staff only)
// @route   POST /api/grievances/:id/resolution
// @access  Private (Admin/Staff)
router.post('/:id/resolution', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { description, actions } = req.body;

    if (!description || !actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        message: 'Description and actions are required'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.setResolution(description, actions, req.user._id);
    await grievance.save();

    res.json({
      success: true,
      message: 'Resolution set successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Set resolution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set resolution',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add feedback (User only)
// @route   POST /api/grievances/:id/feedback
// @access  Private
router.post('/:id/feedback', protect, validateId, checkResourceAccess('grievance'), sanitizeInput, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    if (grievance.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only provide feedback for resolved grievances'
      });
    }

    if (grievance.feedback && grievance.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already provided for this grievance'
      });
    }

    grievance.addFeedback(rating, comment);
    await grievance.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Assign grievance (Admin/Staff only)
// @route   PUT /api/grievances/:id/assign
// @access  Private (Admin/Staff)
router.put('/:id/assign', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { assignedTo, assignedDepartment } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user ID is required'
      });
    }

    // Verify assigned user exists and is staff/admin
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || !['admin', 'staff'].includes(assignedUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned user'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.assignedTo = assignedTo;
    if (assignedDepartment) {
      grievance.assignedDepartment = assignedDepartment;
    }
    
    await grievance.save();

    res.json({
      success: true,
      message: 'Grievance assigned successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Assign grievance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign grievance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get grievance statistics
// @route   GET /api/grievances/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    let matchQuery = {};

    // For citizens, only show their grievances
    if (req.user.role === 'citizen') {
      matchQuery.user = req.user._id;
    }

    const stats = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalGrievances = await Grievance.countDocuments(matchQuery);
    const openGrievances = await Grievance.countDocuments({
      ...matchQuery,
      status: { $in: ['open', 'in_progress'] }
    });

    const avgResolutionTime = await Grievance.aggregate([
      { 
        $match: { 
          ...matchQuery,
          status: 'resolved',
          actualResolutionTime: { $exists: true }
        } 
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$actualResolutionTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalGrievances,
        openGrievances,
        statusBreakdown: stats,
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Get grievance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;