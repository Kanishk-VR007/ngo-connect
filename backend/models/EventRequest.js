const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Request must have a requester']
    },
    eventType: {
        type: String,
        enum: [
            'Health Camp',
            'Education Workshop',
            'Food Distribution',
            'Blood Donation',
            'Skill Development',
            'Environmental Cleanup',
            'Awareness Campaign',
            'Fundraising',
            'Community Service',
            'Other'
        ],
        required: [true, 'Please specify event type']
    },
    description: {
        type: String,
        required: [true, 'Please provide description of what you need']
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
        state: String,
        country: String
    },
    preferredDate: {
        type: Date,
        required: [true, 'Please provide preferred date']
    },
    targetNGO: {
        // Optional - user can target specific NGO or leave open for any NGO
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    assignedTo: {
        // NGO that accepted the request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        default: null
    },
    createdEvent: {
        // Link to the event created from this request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },
    responseMessage: {
        // Message from NGO when accepting/rejecting
        type: String,
        default: ''
    },
    respondedAt: {
        type: Date,
        default: null
    },
    respondedBy: {
        // User from NGO who responded
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    expectedAttendees: {
        type: Number,
        default: null
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Indexes
eventRequestSchema.index({ 'location.coordinates': '2dsphere' });
eventRequestSchema.index({ status: 1 });
eventRequestSchema.index({ requestedBy: 1 });
eventRequestSchema.index({ targetNGO: 1 });
eventRequestSchema.index({ assignedTo: 1 });
eventRequestSchema.index({ eventType: 1 });

module.exports = mongoose.model('EventRequest', eventRequestSchema);
