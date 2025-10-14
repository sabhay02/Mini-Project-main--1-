const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🌟 CORRECTION/IMPROVEMENT: Import dependent models at the top
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else if (!token) { // Use else if to avoid double response
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your account before accessing this resource'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // If token fails validation, clear user and proceed
      req.user = null;
    }
  } else {
    // If no token, clear user and proceed
    req.user = null;
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This is a placeholder. In a production environment, implement proper rate limiting
  // using a library like 'express-rate-limit' or Redis.
  next();
};

// Check if user can access resource (Authorization: User owns resource)
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.applicationId || req.params.grievanceId;

      if (!req.user) {
         // Should not happen if 'protect' is used before this middleware, but safe to check.
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // For admin/staff users, allow access to all resources
      if (req.user.role === 'admin' || req.user.role === 'staff') {
        return next();
      }

      // For citizen users, check if they own the resource
      let resource;
      switch (resourceType) {
        case 'application':
             // 🌟 CORRECTION: Use imported Application model
            resource = await Application.findById(resourceId);
            break;
        case 'grievance':
             // 🌟 CORRECTION: Use imported Grievance model
            resource = await Grievance.findById(resourceId);
            break;
        default:
            return res.status(400).json({
              success: false,
              message: 'Invalid resource type'
            });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource (Must convert to string for proper ObjectId comparison)
      if (resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      // Catching common errors like invalid ObjectId format (CastError)
      const statusCode = error.name === 'CastError' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: 'Error checking resource access',
        error: error.name === 'CastError' ? 'Invalid Resource ID format' : error.message
      });
    }
  };
};

// Validate user permissions for admin operations (Placeholder for granular RBAC)
const validateAdminPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Logic for checking specific permissions (e.g., if admin has 'can_edit_schemes') 
    // would be implemented here using `requiredPermissions`.
    
    next();
  };
};

module.exports = {
  protect,
  authorize,
  requireVerification,
  optionalAuth,
  sensitiveOperationLimit,
  checkResourceAccess,
  validateAdminPermissions
};