import express from 'express';
const router = express.Router();
import Application from '../models/Application.js';
import Grievance from '../models/Grievance.js';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Announcement from '../models/Announcement.js';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateId,
  validatePagination,
  validateStatusUpdate,
  sanitizeInput
} from '../middleware/validation.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Staff)
router.get('/dashboard', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    // Get application statistics
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get grievance statistics
    const grievanceStats = await Grievance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total applications count
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    // Get total grievances count
    const totalGrievances = await Grievance.countDocuments();
    const resolvedGrievances = await Grievance.countDocuments({ status: 'resolved' });

    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email phone')
      .select('applicationId title type status createdAt user');

    // Get recent grievances
    const recentGrievances = await Grievance.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email phone')
      .select('grievanceId title category status createdAt user');

    // Get pending applications count
    const pendingApplications = await Application.countDocuments({
      status: { $in: ['submitted', 'under_review'] }
    });

    // Get open grievances count
    const openGrievances = await Grievance.countDocuments({
      status: { $in: ['open', 'in_progress'] }
    });

    // Get total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Get schemes statistics
    const totalSchemes = await Scheme.countDocuments();
    const activeSchemes = await Scheme.countDocuments({ status: 'active' });

    // Get services statistics
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ status: 'active' });

    // Get announcements statistics
    const totalAnnouncements = await Announcement.countDocuments();
    const publishedAnnouncements = await Announcement.countDocuments({ status: 'published' });

    res.json({
      success: true,
      data: {
        statistics: {
          applications: applicationStats,
          grievances: grievanceStats,
          users: userStats,
          totalApplications,
          approvedApplications,
          rejectedApplications,
          totalGrievances,
          resolvedGrievances,
          pendingApplications,
          openGrievances,
          totalUsers,
          totalSchemes,
          activeSchemes,
          totalServices,
          activeServices,
          totalAnnouncements,
          publishedAnnouncements
        },
        recentApplications,
        recentGrievances
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all applications (Admin view)
// @route   GET /api/admin/applications
// @access  Private (Admin/Staff)
router.get('/applications', protect, authorize('admin', 'staff'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by assigned user if provided
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('reviewComments.reviewer', 'name email');

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
    console.error('Get admin applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all grievances (Admin view)
// @route   GET /api/admin/grievances
// @access  Private (Admin/Staff)
router.get('/grievances', protect, authorize('admin', 'staff'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

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

    // Filter by assigned user if provided
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const grievances = await Grievance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('timeline.updatedBy', 'name email');

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
    console.error('Get admin grievances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievances',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by role if provided
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by verification status if provided
    if (req.query.isVerified !== undefined) {
      query.isVerified = req.query.isVerified === 'true';
    }

    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -otp -verificationToken');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update application status
// @route   PUT /api/admin/applications/:id/status
// @access  Private (Admin/Staff)
router.put('/applications/:id/status', protect, authorize('admin', 'staff'), validateId, validateStatusUpdate, sanitizeInput, async (req, res) => {
  try {
    const { status, comment } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;

    if (status === 'approved' || status === 'rejected') {
      if (!application.completionDate) {
        application.completionDate = new Date();
      }
      if (application.submissionDate) {
        application.actualProcessingTime = Math.floor(
          (application.completionDate.getTime() - application.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    if (comment) {
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

// @desc    Update grievance status
// @route   PUT /api/admin/grievances/:id/status
// @access  Private (Admin/Staff)
router.put('/grievances/:id/status', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.addTimelineUpdate(status, comment || '', req.user._id);
    await grievance.save();

    res.json({
      success: true,
      message: 'Grievance status updated successfully',
      data: {
        grievance
      }
    });
  } catch (error) {
    console.error('Update grievance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grievance status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', protect, authorize('admin'), validateId, sanitizeInput, async (req, res) => {
  try {
    const { isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user.id.toString()) {
      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot change their own role.'
        });
      }
      if (isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Self-deactivation is blocked via admin panel.'
        });
      }
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (role && ['citizen', 'staff', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create new service
// @route   POST /api/admin/services
// @access  Private (Admin/Staff)
router.post('/services', protect, authorize('admin', 'staff'), sanitizeInput, async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      metadata: {
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      }
    };

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all services (Admin view)
// @route   GET /api/admin/services
// @access  Private (Admin/Staff)
router.get('/services', protect, authorize('admin', 'staff'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.department) {
      query.department = req.query.department;
    }

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email');

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get admin services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update service
// @route   PUT /api/admin/services/:id
// @access  Private (Admin/Staff)
router.put('/services/:id', protect, authorize('admin', 'staff'), validateId, sanitizeInput, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const allowedUpdates = [
      'name',
      'nameHindi',
      'description',
      'descriptionHindi',
      'category',
      'subCategory',
      'department',
      'features',
      'requirements',
      'processingTime',
      'fees',
      'status',
      'priority',
      'icon',
      'image',
      'contactInfo',
      'applicationProcess',
      'eligibility',
      'tags',
      'languages',
      'featured'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    service.metadata.lastModifiedBy = req.user._id;
    if (service.metadata.version !== undefined) {
      service.metadata.version += 1;
    }

    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin/Staff)
router.delete('/services/:id', protect, authorize('admin', 'staff'), validateId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin/Staff)
router.get('/analytics', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const applicationAnalytics = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const grievanceAnalytics = await Grievance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const userAnalytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        applications: applicationAnalytics,
        grievances: grievanceAnalytics,
        users: userAnalytics,
        period: days
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// NOTE: All announcement routes have been removed from admin.js
// Use the dedicated /api/announcements routes in announcements.js instead

export default router;