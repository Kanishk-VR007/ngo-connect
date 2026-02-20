const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private
router.get('/', auth, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, userController.getUserById);

module.exports = router;
