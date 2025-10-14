const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateSchemeSearch,
  validateId,
  validatePagination,
  sanitizeInput
} = require('../middleware/validation');

// @desc    Get all schemes
// @route   GET /api/schemes
// @access  Public
router.get('/', validateSchemeSearch, async (req, res) => {
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

    if (req.query.level) {
      query.level = req.query.level;
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

    const schemes = await Scheme.find(query, req.query.q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit);

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
    console.error('Get schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get featured schemes
// @route   GET /api/schemes/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const schemes = await Scheme.getFeatured(limit);

    res.json({
      success: true,
      data: {
        schemes
      }
    });
  } catch (error) {
    console.error('Get featured schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Public
router.get('/:id', validateId, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    if (scheme.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Scheme not available'
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

// @desc    Check scheme eligibility
// @route   POST /api/schemes/:id/check-eligibility
// @access  Private
router.post('/:id/check-eligibility', protect, validateId, sanitizeInput, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    if (scheme.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Scheme not available'
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

    const eligibilityResult = scheme.checkEligibility(userData);

    res.json({
      success: true,
      data: {
        eligible: eligibilityResult.eligible,
        reasons: eligibilityResult.reasons,
        scheme: {
          name: scheme.name,
          nameHindi: scheme.nameHindi,
          benefits: scheme.benefits,
          applicationProcess: scheme.applicationProcess
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

// @desc    Get scheme categories
// @route   GET /api/schemes/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Scheme.distinct('category', { status: 'active' });
    
    const categoryMap = {
      'agriculture': 'Agriculture',
      'education': 'Education',
      'healthcare': 'Healthcare',
      'housing': 'Housing',
      'employment': 'Employment',
      'women_welfare': 'Women Welfare',
      'senior_citizens': 'Senior Citizens',
      'disabled_welfare': 'Disabled Welfare',
      'social_security': 'Social Security',
      'infrastructure': 'Infrastructure',
      'environment': 'Environment',
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

// @desc    Get scheme departments
// @route   GET /api/schemes/departments
// @access  Public
router.get('/meta/departments', async (req, res) => {
  try {
    const departments = await Scheme.distinct('department', { status: 'active' });
    
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

// @desc    Search schemes
// @route   GET /api/schemes/search/suggestions
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

    const suggestions = await Scheme.find(
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

// @desc    Get scheme statistics
// @route   GET /api/schemes/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalSchemes = await Scheme.countDocuments({ status: 'active' });
    
    const categoryStats = await Scheme.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const levelStats = await Scheme.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalSchemes,
        categoryStats,
        levelStats
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

module.exports = router;
