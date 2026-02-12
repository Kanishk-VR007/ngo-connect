const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  serviceCategory: {
    type: String,
    required: [true, 'Please specify service category'],
    enum: [
      'Education',
      'Healthcare',
      'Food & Nutrition',
      'Shelter',
      'Women Empowerment',
      'Child Welfare',
      'Environmental',
      'Disaster Relief',
      'Elderly Care',
      'Skill Development',
      'Legal Aid',
      'Other'
    ]
  },
  title: {
    type: String,
    required: [true, 'Please provide request title']
  },
  description: {
    type: String,
    required: [true, 'Please provide request description']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  contactInfo: {
    phone: String,
    alternatePhone: String,
    email: String
  },
  attachments: [{
    type: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseNotes: {
    type: String
  },
  completionDate: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

serviceRequestSchema.index({ ngoId: 1, status: 1 });
serviceRequestSchema.index({ requestedBy: 1 });
serviceRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
