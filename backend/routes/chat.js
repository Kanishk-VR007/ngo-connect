const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// @route   GET /api/chat
// @desc    Get all chats for user
// @access  Private
router.get('/', auth, chatController.getChats);

// @route   GET /api/chat/:chatId
// @desc    Get single chat with messages
// @access  Private
router.get('/:chatId', auth, chatController.getChatById);

// @route   POST /api/chat
// @desc    Create or get existing chat
// @access  Private
router.post('/', auth, chatController.createChat);

// @route   POST /api/chat/:chatId/message
// @desc    Send message in chat
// @access  Private
router.post('/:chatId/message', auth, chatController.sendMessage);

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', auth, chatController.markAsRead);

module.exports = router;
