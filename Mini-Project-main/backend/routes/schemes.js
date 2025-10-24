import express from 'express';
const router = express.Router();
import Scheme from '../models/Scheme.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateSchemeCreate, // <-- Imported correctly
  validateSchemeUpdate, // <-- Imported correctly
  validateId,
  sanitizeInput
} from '../middleware/validation.js';

// All routes require authentication and admin/staff authorization
router.use(protect);
router.use(authorize('admin', 'staff'));

// @desc    Get all schemes (admin view - includes inactive)
// @route   GET /api/admin/schemes
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
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

    if (req.query.q) {
      query.$text = { $search: req.query.q };
    }

    const schemes = await Scheme.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email');

    const total = await Scheme.countDocuments(query);

    res.json({
      success: true,
      data: {
        schemes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Admin get schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create new scheme
// @route   POST /api/admin/schemes
// @access  Private/Admin
// 🌟 FIX: Apply validateSchemeCreate middleware
router.post('/', validateSchemeCreate, sanitizeInput, async (req, res) => {
  try {
    // Add metadata
    const schemeData = {
      ...req.body,
      metadata: {
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      }
    };

    const scheme = await Scheme.create(schemeData);

    res.status(201).json({
      success: true,
      data: {
        scheme
      },
      message: 'Scheme created successfully'
    });
  } catch (error) {
    console.error('Create scheme error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A scheme with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single scheme (admin view)
// @route   GET /api/admin/schemes/:id
// @access  Private/Admin
router.get('/:id', validateId, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email');

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.json({
      success: true,
      data: {
        scheme
      }
    });
  } catch (error) {
    console.error('Get scheme error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update scheme
// @route   PUT /api/admin/schemes/:id
// @access  Private/Admin
// 🌟 FIX: Apply validateSchemeUpdate middleware
router.put('/:id', validateId, validateSchemeUpdate, sanitizeInput, async (req, res) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    // Update metadata
    const updateData = {
      ...req.body,
      'metadata.lastModifiedBy': req.user._id,
      'metadata.version': scheme.metadata.version + 1
    };

    scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: {
        scheme
      },
      message: 'Scheme updated successfully'
    });
  } catch (error) {
    console.error('Update scheme error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete scheme
// @route   DELETE /api/admin/schemes/:id
// @access  Private/Admin
router.delete('/:id', validateId, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    // Soft delete by setting status to discontinued
    // Or hard delete based on your requirements
    await scheme.deleteOne();

    res.json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    console.error('Delete scheme error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Toggle scheme status
// @route   PATCH /api/admin/schemes/:id/status
// @access  Private/Admin
router.patch('/:id/status', validateId, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended', 'discontinued'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        'metadata.lastModifiedBy': req.user._id
      },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.json({
      success: true,
      data: {
        scheme
      },
      message: `Scheme status updated to ${status}`
    });
  } catch (error) {
    console.error('Update scheme status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheme status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Toggle featured status
// @route   PATCH /api/admin/schemes/:id/featured
// @access  Private/Admin
router.patch('/:id/featured', validateId, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    scheme.featured = !scheme.featured;
    scheme.metadata.lastModifiedBy = req.user._id;
    await scheme.save();

    res.json({
      success: true,
      data: {
        scheme
      },
      message: `Scheme ${scheme.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get scheme statistics
// @route   GET /api/admin/schemes/stats/dashboard
// @access  Private/Admin
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalSchemes = await Scheme.countDocuments();
    const activeSchemes = await Scheme.countDocuments({ status: 'active' });
    const inactiveSchemes = await Scheme.countDocuments({ status: 'inactive' });
    const suspendedSchemes = await Scheme.countDocuments({ status: 'suspended' });

    const categoryStats = await Scheme.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const departmentStats = await Scheme.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalSchemes,
        activeSchemes,
        inactiveSchemes,
        suspendedSchemes,
        categoryStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Get scheme stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
