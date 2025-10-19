import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];


// Application submission validation
const validateApplicationSubmission = [
  body('type')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Application type is required and must be between 1 and 100 characters'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('personalDetails.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('personalDetails.dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('personalDetails.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  
  handleValidationErrors
];

// Grievance submission validation
const validateGrievanceSubmission = [
  body('category')
    .isIn([
      'water_supply',
      'electricity',
      'road_repair',
      'street_lights',
      'drainage',
      'garbage_collection',
      'healthcare',
      'education',
      'corruption',
      'other'
    ])
    .withMessage('Invalid grievance category'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  handleValidationErrors
];

// Scheme search validation
const validateSchemeSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isIn([
      'agriculture',
      'education',
      'healthcare',
      'housing',
      'employment',
      'women_welfare',
      'senior_citizens',
      'disabled_welfare',
      'social_security',
      'infrastructure',
      'environment',
      'other'
    ])
    .withMessage('Invalid category'),
  
  query('department')
    .optional()
    .isIn([
      'agriculture',
      'education',
      'health',
      'rural_development',
      'women_child_development',
      'social_justice',
      'labour',
      'housing',
      'finance',
      'other'
    ])
    .withMessage('Invalid department'),
  
  query('level')
    .optional()
    .isIn(['central', 'state', 'district', 'village'])
    .withMessage('Invalid level'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Announcement validation
const validateAnnouncement = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('type')
    .isIn([
      'general',
      'scheme_launch',
      'deadline_reminder',
      'policy_update',
      'event_notification',
      'emergency',
      'maintenance',
      'holiday',
      'other'
    ])
    .withMessage('Invalid announcement type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('category')
    .optional()
    .isIn([
      'schemes',
      'services',
      'events',
      'deadlines',
      'maintenance',
      'policy',
      'emergency',
      'general'
    ])
    .withMessage('Invalid category'),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Status update validation
const validateStatusUpdate = [
  body('status')
    .isIn([
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'completed',
      'open',
      'in_progress',
      'resolved',
      'closed'
    ])
    .withMessage('Invalid status'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        });
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.name} has an invalid type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  };
};

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

export {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateApplicationSubmission,
  validateGrievanceSubmission,
  validateSchemeSearch,
  validateAnnouncement,
  validateId,
  validatePagination,
  validateStatusUpdate,
  validateFileUpload,
  sanitizeInput
};
