const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NGO = require('../models/NGO');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to fetch user from database
      try {
        req.user = await User.findById(decoded.id);

        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'User not found'
          });
        }

        next();
      } catch (dbErr) {
        console.error('Database error in auth middleware:', dbErr.message);
        
        // If database is unreachable, still allow token verification
        if (dbErr.message.includes('connect') || dbErr.name === 'MongoServerError') {
          console.warn('Database unavailable - proceeding with token verification only');
          req.user = { id: decoded.id };
          return next();
        }
        
        throw dbErr;
      }
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.message.includes('Token')) {
        return res.status(401).json({
          success: false,
          error: 'Token is invalid or expired'
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

// Middleware to check if user has required role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user is NGO founder
const requireNGOFounder = async (req, res, next) => {
  try {
    const ngoId = req.params.id || req.params.ngoId || req.body.ngoId;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    try {
      const ngo = await NGO.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          error: 'NGO not found'
        });
      }

      // Check if user is the founder
      if (ngo.founderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Only NGO founder can perform this action'
        });
      }

      req.ngo = ngo;
      next();
    } catch (dbErr) {
      console.error('Database error in requireNGOFounder:', dbErr.message);
      if (dbErr.message.includes('connect') || dbErr.name === 'MongoServerError') {
        return res.status(503).json({
          success: false,
          error: 'Database service unavailable',
          retryAfter: 30
        });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('requireNGOFounder error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user is NGO member or founder
const requireNGOMember = async (req, res, next) => {
  try {
    const ngoId = req.params.id || req.params.ngoId || req.body.ngoId;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    try {
      const ngo = await NGO.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          error: 'NGO not found'
        });
      }

      // Check if user is founder
      const isFounder = ngo.founderId.toString() === req.user._id.toString();

      // Check if user is a member
      const isMember = ngo.members.some(
        member => member.userId.toString() === req.user._id.toString()
      );

      if (!isFounder && !isMember) {
        return res.status(403).json({
          success: false,
          error: 'You must be a member of this NGO to perform this action'
        });
      }

      req.ngo = ngo;
      req.isFounder = isFounder;

      // Get member details if not founder
      if (isMember && !isFounder) {
        req.memberDetails = ngo.members.find(
          member => member.userId.toString() === req.user._id.toString()
        );
      }

      next();
    } catch (dbErr) {
      console.error('Database error in requireNGOMember:', dbErr.message);
      if (dbErr.message.includes('connect') || dbErr.name === 'MongoServerError') {
        return res.status(503).json({
          success: false,
          error: 'Database service unavailable',
          retryAfter: 30
        });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('requireNGOMember error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check specific NGO member permission
const requireNGOPermission = (permission) => {
  return async (req, res, next) => {
    // Founder has all permissions
    if (req.isFounder) {
      return next();
    }

    // Check member permissions
    if (!req.memberDetails || !req.memberDetails.permissions[permission]) {
      return res.status(403).json({
        success: false,
        error: `Permission denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

module.exports = {
  auth,
  requireRole,
  requireAdmin,
  requireNGOFounder,
  requireNGOMember,
  requireNGOPermission
};
