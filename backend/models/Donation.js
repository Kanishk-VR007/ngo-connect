const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide donation amount'],
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  donationType: {
    type: String,
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  purpose: {
    type: String,
    default: 'General Support'
  },
  message: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  receiptUrl: {
    type: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  taxBenefit: {
    eligible: {
      type: Boolean,
      default: true
    },
    certificateUrl: String
  }
}, {
  timestamps: true
});

donationSchema.index({ ngoId: 1, status: 1 });
donationSchema.index({ donorId: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
