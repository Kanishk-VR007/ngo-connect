const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide event title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide event description']
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
        required: true
    },
    hostNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        required: [true, 'Event must have a host NGO']
    },
    collaboratingNGOs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO'
    }],
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
    startDate: {
        type: Date,
        required: [true, 'Please provide event start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide event end date']
    },
    registrationDeadline: {
        type: Date
    },
    capacity: {
        type: Number,
        default: null // null means unlimited
    },
    registeredAttendees: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['registered', 'attended', 'cancelled'],
            default: 'registered'
        }
    }],
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    requirements: {
        type: String, // What volunteers/attendees should bring
        default: ''
    },
    contactPerson: {
        name: String,
        phone: String,
        email: String
    },
    eventRequestId: {
        // Link to event request if this event was created from a user request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventRequest',
        default: null
    }
}, {
    timestamps: true
});

// Index for geospatial queries
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ hostNGO: 1 });
eventSchema.index({ eventType: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
    if (!this.capacity) return false;
    return this.registeredAttendees.length >= this.capacity;
});

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function () {
    const now = new Date();
    if (this.status !== 'upcoming') return false;
    if (this.registrationDeadline && now > this.registrationDeadline) return false;
    if (this.isFull) return false;
    return true;
};

module.exports = mongoose.model('Event', eventSchema);
