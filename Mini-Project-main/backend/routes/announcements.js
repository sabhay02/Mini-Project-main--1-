import express from 'express';
const router = express.Router();
import Announcement from '../models/Announcement.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  validateAnnouncement,
  validateId,
  validatePagination,
  sanitizeInput
} from '../middleware/validation.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query: only fetch published, active, and non-expired announcements
    const query = {
      status: 'published',
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    // Add filters
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Text search implementation (requires a Mongoose text index)
    if (req.query.q) {
      query.$text = { $search: req.query.q };
    }

    // Build sort logic
    let sort = {};
    if (req.query.q) {
      sort.score = { $meta: 'textScore' };
    }
    sort.pinned = -1; // Pinned items appear first
    sort.priority = -1; // High priority next
    sort.publishDate = -1; // Most recent last

    const announcements = await Announcement.find(query, req.query.q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get featured announcements
// @route   GET /api/announcements/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Assumes getFeatured is a static method on the Announcement model
    const announcements = await Announcement.getFeatured(limit);

    res.json({
      success: true,
      data: {
        announcements
      }
    });
  } catch (error) {
    console.error('Get featured announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get recent announcements
// @route   GET /api/announcements/recent
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    // Assumes getRecent is a static method on the Announcement model
    const announcements = await Announcement.getRecent(limit, category);

    res.json({
      success: true,
      data: {
        announcements
      }
    });
  } catch (error) {
    console.error('Get recent announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
router.get('/:id', validateId, optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name email')
      .populate('approvedBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const isStaffOrAdmin = req.user && ['admin', 'staff'].includes(req.user.role);

    // Check visibility rules for non-staff/admin users
    if (!isStaffOrAdmin) {
      // 1. Check if announcement is published and active
      if (announcement.status !== 'published' || !announcement.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // 2. Check if announcement is expired
      if (announcement.expiryDate && new Date().getTime() > announcement.expiryDate.getTime()) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
    }

    // Increment views for public access (anonymous or citizen)
    if (!req.user || req.user.role === 'citizen') {
      // Assumes incrementViews is a method on the Mongoose document
      await announcement.incrementViews();
    }

    res.json({
      success: true,
      data: {
        announcement
      }
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create announcement (Admin/Staff only)
// @route   POST /api/announcements
// @access  Private (Admin/Staff)
router.post('/', protect, authorize('admin', 'staff'), sanitizeInput, validateAnnouncement, async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      author: req.user._id
    };

    const announcement = await Announcement.create(announcementData);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement
      }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update announcement (Admin/Staff only)
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Staff)
router.put('/:id', protect, authorize('admin', 'staff'), validateId, sanitizeInput, validateAnnouncement, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title',
      'titleHindi',
      'content',
      'contentHindi',
      'type',
      'priority',
      'category',
      'targetAudience',
      'specificGroups',
      'locations',
      'attachments',
      'image',
      'expiryDate',
      'featured',
      'pinned',
      'tags',
      'language',
      'status', // Added status to allowed updates for staff/admin management
      'isActive' // Added isActive to allowed updates for staff/admin management
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        announcement[field] = req.body[field];
      }
    });

    // Update metadata
    announcement.metadata.lastModifiedBy = req.user._id;
    // Assuming metadata.version exists and is a number
    if (announcement.metadata.version !== undefined) {
        announcement.metadata.version += 1;
    }


    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        announcement
      }
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete announcement (Admin/Staff only)
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/Staff)
router.delete('/:id', protect, authorize('admin', 'staff'), validateId, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Publish announcement (Admin/Staff only)
// @route   PUT /api/announcements/:id/publish
// @access  Private (Admin/Staff)
router.put('/:id/publish', protect, authorize('admin', 'staff'), validateId, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Assumes publish is a method on the Mongoose document that sets status/publishDate
    announcement.publish();
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement published successfully',
      data: {
        announcement
      }
    });
  } catch (error) {
    console.error('Publish announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Archive announcement (Admin/Staff only)
// @route   PUT /api/announcements/:id/archive
// @access  Private (Admin/Staff)
router.put('/:id/archive', protect, authorize('admin', 'staff'), validateId, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Assumes archive is a method on the Mongoose document that sets status/isActive
    announcement.archive();
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement archived successfully',
      data: {
        announcement
      }
    });
  } catch (error) {
    console.error('Archive announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Increment shares
// @route   POST /api/announcements/:id/share
// @access  Public
router.post('/:id/share', validateId, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Assumes incrementShares is a method on the Mongoose document
    await announcement.incrementShares();

    res.json({
      success: true,
      message: 'Share recorded successfully'
    });
  } catch (error) {
    console.error('Share announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record share',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get announcement categories
// @route   GET /api/announcements/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Announcement.distinct('category', {
      status: 'published',
      isActive: true
    });

    const categoryMap = {
      'schemes': 'Schemes',
      'services': 'Services',
      'events': 'Events',
      'deadlines': 'Deadlines',
      'maintenance': 'Maintenance',
      'policy': 'Policy',
      'emergency': 'Emergency',
      'general': 'General'
    };

    const formattedCategories = categories.map(cat => ({
      value: cat,
      label: categoryMap[cat] || cat
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments({
      status: 'published',
      isActive: true
    });

    const categoryStats = await Announcement.aggregate([
      {
        $match: {
          status: 'published',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const typeStats = await Announcement.aggregate([
      {
        $match: {
          status: 'published',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalAnnouncements,
        categoryStats,
        typeStats
      }
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;