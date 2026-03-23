const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('roleId');
    
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'User not found',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};
