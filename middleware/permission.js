const User = require('../models/User');

// Check if user has specific permission
exports.hasPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          success: false,
          message: 'Not authorized to access this route',
        });
      }

      // Get user with populated role
      const user = await User.findById(req.user.id).populate('roleId');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          success: false,
          message: 'User not found',
        });
      }

      if (!user.roleId) {
        return res.status(500).json({
          status: 'error',
          success: false,
          message: 'User role is not properly configured',
        });
      }

      if (!user.roleId.isActive) {
        return res.status(403).json({
          status: 'error',
          success: false,
          message: 'Your assigned role is inactive',
        });
      }

      // Combine role permissions with user-specific permissions
      const userPermissions = [
        ...(user.roleId.permissions || []),
        ...(user.permissions || []),
      ];

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: 'error',
          success: false,
          message: 'You do not have permission to perform this action',
          required: requiredPermissions,
        });
      }

      // Attach user permissions to request for later use
      req.userPermissions = userPermissions;
      req.userRole = user.roleId;

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        success: false,
        message: error.message,
      });
    }
  };
};

// Check if user has all specified permissions
exports.hasAllPermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          success: false,
          message: 'Not authorized to access this route',
        });
      }

      const user = await User.findById(req.user.id).populate('roleId');
      
      if (!user || !user.roleId) {
        return res.status(403).json({
          status: 'error',
          success: false,
          message: 'Invalid user or role configuration',
        });
      }

      const userPermissions = [
        ...(user.roleId.permissions || []),
        ...(user.permissions || []),
      ];

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          status: 'error',
          success: false,
          message: 'You do not have all required permissions',
          required: requiredPermissions,
        });
      }

      req.userPermissions = userPermissions;
      req.userRole = user.roleId;

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        success: false,
        message: error.message,
      });
    }
  };
};

// Check if user is Super Admin
exports.isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    const user = await User.findById(req.user.id).populate('roleId');
    
    if (!user || !user.roleId) {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Invalid user or role configuration',
      });
    }

    // Check if user's role is super-admin
    if (user.roleId.slug !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Only Super Admin can perform this action',
      });
    }

    req.userRole = user.roleId;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      success: false,
      message: error.message,
    });
  }
};
