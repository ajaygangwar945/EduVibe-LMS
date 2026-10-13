const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes - verify user is logged in
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please provide a valid Bearer token.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'eduvibe_docker_jwt_key_2026';
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token payload.' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    // If faculty, check if approved
    if (user.role === 'faculty' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your faculty account is pending admin approval. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid, malformed, or expired token.' });
  }
};

// Grant access to specific roles: e.g. authorize('admin'), authorize('faculty', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
