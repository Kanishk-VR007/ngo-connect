const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper to check database status and provide appropriate error
const handleDBError = (error, res, operation = 'operation') => {
  console.error(`Database error during ${operation}:`, error.message);
  
  if (error.message.includes('connect') || error.name === 'MongoServerError' || error.message.includes('ENOTFOUND')) {
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable. Please try again later.',
      retryAfter: 30,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
    });
  }
  
  return res.status(500).json({
    success: false,
    error: `Server error during ${operation}`
  });
};

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, location, role, bio } = req.body;

    // Validate role if provided
    const validRoles = ['user', 'ngo_founder', 'ngo_member', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Create user with default avatar
      const profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3b82f6,8b5cf6,ec4899,f59e0b,10b981`;

      const user = await User.create({
        name,
        email,
        password,
        phone,
        location,
        role: role || 'user',
        bio: bio || '',
        profilePicture
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
          }
        }
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'registration');
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      // Find user with password field
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            ngoId: user.ngoId
          }
        }
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'login');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    try {
      const user = await User.findById(req.user.id).populate('ngoId', 'name logo');

      res.json({
        success: true,
        data: user
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'fetching user profile');
    }
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, profilePicture } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, location, profilePicture },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: user
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'updating profile');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id).select('+password');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'changing password');
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
