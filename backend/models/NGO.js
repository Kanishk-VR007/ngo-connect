const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide NGO name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide NGO description']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  website: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    pincode: String
  },
  serviceCategories: [{
    type: String,
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
  }],
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  foundedYear: {
    type: Number
  },
  teamSize: {
    type: Number,
    default: 0
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    images: [String]
  }],
  activities: [{
    title: String,
    description: String,
    date: Date,
    participants: Number,
    images: [String]
  }],
  statistics: {
    peopleHelped: {
      type: Number,
      default: 0
    },
    projectsCompleted: {
      type: Number,
      default: 0
    },
    donationsReceived: {
      type: Number,
      default: 0
    },
    volunteersEngaged: {
      type: Number,
      default: 0
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
ngoSchema.index({ 'location.coordinates': '2dsphere' });
ngoSchema.index({ serviceCategories: 1 });
ngoSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('NGO', ngoSchema);
