const mongoose = require('mongoose');

const ngoApplicationSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  position: {
    type: String,
    default: 'Volunteer'
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  skills: [{
    type: String
  }],
  availability: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

ngoApplicationSchema.index({ ngoId: 1, status: 1 });
ngoApplicationSchema.index({ applicantId: 1 });

module.exports = mongoose.model('NGOApplication', ngoApplicationSchema);
