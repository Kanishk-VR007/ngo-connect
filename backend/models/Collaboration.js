const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
    requestingNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        required: [true, 'Requesting NGO is required']
    },
    targetNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        required: [true, 'Target NGO is required']
    },
    purpose: {
        type: String,
        required: [true, 'Please provide collaboration purpose'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    proposedActivities: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'ended'],
        default: 'pending'
    },
    requestedBy: {
        // User (founder/admin) who created the request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    respondedBy: {
        // User (founder/admin) who approved/rejected
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    responseMessage: {
        type: String,
        default: ''
    },
    approvedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    },
    duration: {
        // Expected duration in months
        type: Number,
        default: null
    },
    sharedEvents: [{
        // Events created together
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    sharedResources: {
        type: String,
        default: ''
    },
    achievements: [{
        description: String,
        date: Date
    }]
}, {
    timestamps: true
});

// Indexes
collaborationSchema.index({ requestingNGO: 1 });
collaborationSchema.index({ targetNGO: 1 });
collaborationSchema.index({ status: 1 });

// Prevent duplicate collaborations between  same NGOs
collaborationSchema.index({ requestingNGO: 1, targetNGO: 1 }, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved', 'active'] } }
});

module.exports = mongoose.model('Collaboration', collaborationSchema);
