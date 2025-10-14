const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateId,
  validatePagination,
  sanitizeInput
} = require('../middleware/validation');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      status: 'active'
    };

    // Add filters
    if (req.query.q) {
      query.$text = { $search: req.query.q };
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Build sort
    let sort = {};
    if (req.query.q) {
      sort.score = { $meta: 'textScore' };
    }
    sort.priority = -1;
    sort.createdAt = -1;

    const services = await Service.find(query, req.query.q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit);

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
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const services = await Service.getFeatured(limit);

    res.json({
      success: true,
      data: {
        services
      }
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', validateId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Service not available'
      });
    }

    res.json({
      success: true,
      data: {
        service
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Check service eligibility
// @route   POST /api/services/:id/check-eligibility
// @access  Private
router.post('/:id/check-eligibility', protect, validateId, sanitizeInput, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Service not available'
      });
    }

    // Get user data for eligibility check
    const userData = {
      dateOfBirth: req.body.dateOfBirth,
      income: req.body.income,
      gender: req.body.gender,
      state: req.body.state,
      district: req.body.district
    };

    const eligibilityResult = service.checkEligibility(userData);

    res.json({
      success: true,
      data: {
        eligible: eligibilityResult.eligible,
        reasons: eligibilityResult.reasons,
        service: {
          name: service.name,
          nameHindi: service.nameHindi,
          features: service.features,
          applicationProcess: service.applicationProcess
        }
      }
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Service.distinct('category', { status: 'active' });
    
    const categoryMap = {
      'essential': 'Essential',
      'welfare': 'Welfare',
      'community': 'Community',
      'infrastructure': 'Infrastructure',
      'environment': 'Environment',
      'emergency': 'Emergency',
      'sanitation': 'Sanitation',
      'security': 'Security',
      'construction': 'Construction',
      'maintenance': 'Maintenance',
      'information': 'Information',
      'other': 'Other'
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

// @desc    Get service departments
// @route   GET /api/services/departments
// @access  Public
router.get('/meta/departments', async (req, res) => {
  try {
    const departments = await Service.distinct('department', { status: 'active' });
    
    const departmentMap = {
      'agriculture': 'Agriculture',
      'education': 'Education',
      'health': 'Health',
      'rural_development': 'Rural Development',
      'women_child_development': 'Women & Child Development',
      'social_justice': 'Social Justice',
      'labour': 'Labour',
      'housing': 'Housing',
      'finance': 'Finance',
      'other': 'Other'
    };

    const formattedDepartments = departments.map(dept => ({
      value: dept,
      label: departmentMap[dept] || dept
    }));

    res.json({
      success: true,
      data: {
        departments: formattedDepartments
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Search services
// @route   GET /api/services/search/suggestions
// @access  Public
router.get('/search/suggestions', sanitizeInput, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    const suggestions = await Service.find(
      {
        status: 'active',
        $text: { $search: q }
      },
      {
        score: { $meta: 'textScore' },
        name: 1,
        nameHindi: 1,
        category: 1
      }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get service statistics
// @route   GET /api/services/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalServices = await Service.countDocuments({ status: 'active' });
    
    const categoryStats = await Service.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const departmentStats = await Service.aggregate([
      { $match: { status: 'active' } },
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
        totalServices,
        categoryStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
