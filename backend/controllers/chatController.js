const Chat = require('../models/Chat');

// @desc    Get all chats for user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.userId': req.user.id,
      isActive: true
    })
      .populate('participants.userId', 'name email profilePicture')
      .populate('ngoId', 'name logo')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single chat
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants.userId', 'name email profilePicture')
      .populate('ngoId', 'name logo')
      .populate('messages.senderId', 'name profilePicture');

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.userId._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create or get existing chat
exports.createChat = async (req, res) => {
  try {
    const { ngoId, recipientId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      ngoId,
      'participants.userId': { $all: [req.user.id, recipientId] }
    });

    if (chat) {
      return res.json({
        success: true,
        data: chat
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [
        { userId: req.user.id, role: 'user' },
        { userId: recipientId, role: 'ngo' }
      ],
      ngoId,
      messages: []
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.userId', 'name email profilePicture')
      .populate('ngoId', 'name logo');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Send message
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachments } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const message = {
      senderId: req.user.id,
      content,
      attachments,
      timestamp: Date.now()
    };

    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageAt = Date.now();

    await chat.save();

    // Emit socket event (handled by Socket.IO in server.js)
    const io = req.app.get('io');
    io.to(req.params.chatId).emit('receive_message', {
      chatId: req.params.chatId,
      message
    });

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Mark all messages not sent by current user as read
    chat.messages.forEach(message => {
      if (message.senderId.toString() !== req.user.id) {
        message.isRead = true;
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
