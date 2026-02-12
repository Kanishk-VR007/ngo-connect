const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String
  }]
});

const chatSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'ngo']
    }
  }],
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ ngoId: 1 });
chatSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
