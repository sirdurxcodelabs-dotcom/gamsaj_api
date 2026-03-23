const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional authentication - sets req.user if token is provided, but doesn't fail if not
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).populate('roleId');
      
      if (req.user && !req.user.isActive) {
        req.user = null; // Deactivated user treated as unauthenticated
      }
    } catch (error) {
      // Invalid token - treat as unauthenticated
      req.user = null;
    }
  }

  next();
};