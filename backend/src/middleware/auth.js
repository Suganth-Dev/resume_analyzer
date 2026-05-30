const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return sendError(res, 'User not found, authorization denied', 401);
      }
      return next();
    } catch (error) {
      console.error('Auth token error:', error);
      return sendError(res, 'Not authorized, token expired or invalid', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Access denied, admin role required', 403);
  }
};

module.exports = { protect, adminOnly };
