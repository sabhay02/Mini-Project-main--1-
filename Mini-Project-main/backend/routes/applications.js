import express from 'express';
const router = express.Router();
import Application from '../models/Application.js';
import User from '../models/User.js';
import { protect, authorize, checkResourceAccess } from '../middleware/auth.js';
import {
  validateApplicationSubmission,
  validateId,
  validatePagination,
  validateStatusUpdate,
  sanitizeInput
} from '../middleware/validation.js';

// @desc    Get user's applications
// @route   GET /api/applications
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

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email phone')
      .select('-reviewComments');

    const total = await Application.countDocuments(query);

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
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Citizen only)
router.get('/:id', protect, authorize('citizen'), validateId, checkResourceAccess('application'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('reviewComments.reviewer', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Submit new application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, sanitizeInput, validateApplicationSubmission, async (req, res) => {
  try {
    // CORRECTION: Enforce status to 'submitted' or explicitly allow 'draft' for a citizen.
    // We default to 'submitted' for this POST route unless the user specifically sends 'draft' 
    // to save progress without submitting for review. This prevents status abuse.
    let status = 'submitted';
    if (req.body.status && req.body.status.toLowerCase() === 'draft') {
        status = 'draft';
    }
    
    const applicationData = {
      ...req.body,
      user: req.user._id,
      status: status 
    };

    const application = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: `Application ${status === 'submitted' ? 'submitted' : 'saved as draft'} successfully`,
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
router.put('/:id', protect, validateId, checkResourceAccess('application'), sanitizeInput, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only allow updates if the status is 'draft'
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update submitted application'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title',
      'description',
      'personalDetails',
      'addressDetails',
      'contactDetails',
      'documents'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete application (only draft applications)
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', protect, validateId, checkResourceAccess('application'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only allow deletion of draft applications
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete submitted application'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add review comment (Admin/Staff only)
// @route   POST /api/applications/:id/comments
// @access  Private (Admin/Staff)
router.post('/:id/comments', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { comment, status } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.addReviewComment(req.user._id, comment, status);
    await application.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Add review comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update application status (Admin/Staff only)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin/Staff)
router.put('/:id/status', protect, authorize('admin', 'staff'), validateId, validateStatusUpdate, sanitizeInput, async (req, res) => {
  try {
    const { status, comment } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // CORRECTION: Always update status and run completion logic, regardless of comment presence.
    application.status = status;

    if (status === 'approved' || status === 'rejected') {
        if (!application.completionDate) { // Only set completionDate once
            application.completionDate = new Date();
        }
        // Calculate actual processing time, only if submissionDate exists
        if (application.submissionDate) {
            application.actualProcessingTime = Math.floor(
                (application.completionDate.getTime() - application.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
            );
        }
    }

    // Add status update comment (if provided)
    if (comment) {
        // Assuming 'addReviewComment' is a method on the Mongoose model
        application.addReviewComment(req.user._id, comment, status);
    } 

    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Assign application (Admin/Staff only)
// @route   PUT /api/applications/:id/assign
// @access  Private (Admin/Staff)
router.put('/:id/assign', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { assignedTo } = req.body;

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

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.assignedTo = assignedTo;
    await application.save();

    res.json({
      success: true,
      message: 'Application assigned successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Assign application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get application statistics
// @route   GET /api/applications/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    let matchQuery = {};

    // For citizens, only show their applications
    if (req.user.role === 'citizen') {
      matchQuery.user = req.user._id;
    } else {
        // Staff/Admin see all applications
        // (No filter needed)
    }

    const stats = await Application.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments(matchQuery);
    const pendingApplications = await Application.countDocuments({
      ...matchQuery,
      status: { $in: ['submitted', 'under_review'] }
    });

    res.json({
      success: true,
      data: {
        totalApplications,
        pendingApplications,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;