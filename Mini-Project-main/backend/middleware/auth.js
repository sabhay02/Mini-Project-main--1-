const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
  }

  if (!token) {
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
      // Continue without authentication
      req.user = null;
    }
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would typically use a more sophisticated rate limiting
  // For now, we'll rely on the global rate limiter
  next();
};

// Check if user can access resource
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.applicationId || req.params.grievanceId;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // For admin users, allow access to all resources
      if (req.user.role === 'admin' || req.user.role === 'staff') {
        return next();
      }

      // For citizen users, check if they own the resource
      let resource;
      switch (resourceType) {
        case 'application':
          const Application = require('../models/Application');
          resource = await Application.findById(resourceId);
          break;
        case 'grievance':
          const Grievance = require('../models/Grievance');
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

      // Check if user owns the resource
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
      return res.status(500).json({
        success: false,
        message: 'Error checking resource access'
      });
    }
  };
};

// Validate user permissions for admin operations
const validateAdminPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Add more permission checks here if needed
    // For now, all admins have full access

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
