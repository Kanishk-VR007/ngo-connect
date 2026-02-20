const Event = require('../models/Event');
const NGO = require('../models/NGO');
const EventRequest = require('../models/EventRequest');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (NGO members/founders only)
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            eventType,
            hostNGO,
            location,
            startDate,
            endDate,
            registrationDeadline,
            capacity,
            visibility,
            requirements,
            contactPerson,
            eventRequestId
        } = req.body;

        // Verify user has permission to create events for this NGO
        const ngo = await NGO.findById(hostNGO);
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: 'NGO not found'
            });
        }

        // Check if user is founder or member with permission
        const isFounder = ngo.founderId.toString() === req.user._id.toString();
        const member = ngo.members.find(m => m.userId.toString() === req.user._id.toString());
        const canCreate = isFounder || (member && member.permissions.canCreateEvents);

        if (!canCreate) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to create events for this NGO'
            });
        }

        const event = await Event.create({
            title,
            description,
            eventType,
            hostNGO,
            location,
            startDate,
            endDate,
            registrationDeadline,
            capacity,
            visibility: visibility || 'public',
            requirements,
            contactPerson,
            eventRequestId
        });

        // If this event was created from an event request, update the request
        if (eventRequestId) {
            await EventRequest.findByIdAndUpdate(eventRequestId, {
                status: 'completed',
                createdEvent: event._id
            });
        }

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error creating event'
        });
    }
};

// @desc    Get all events (public access with filters)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const {
            ngoId,
            eventType,
            city,
            state,
            status,
            startDate,
            endDate,
            lat,
            lng,
            radius = 50 // km
        } = req.query;

        let query = { visibility: 'public' };

        // Filters
        if (ngoId) query.hostNGO = ngoId;
        if (eventType) query.eventType = eventType;
        if (status) query.status = status;
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (state) query['location.state'] = new RegExp(state, 'i');

        // Date range filter
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        // Geospatial query if coordinates provided
        if (lat && lng) {
            query['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // convert km to meters
                }
            };
        }

        const events = await Event.find(query)
            .populate('hostNGO', 'name logo location')
            .populate('collaboratingNGOs', 'name logo')
            .sort({ startDate: 1 });

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching events'
        });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('hostNGO', 'name logo email phone website location')
            .populate('collaboratingNGOs', 'name logo location')
            .populate('registeredAttendees.userId', 'name email profilePicture');

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching event'
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (NGO members/founders only)
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Check permission
        const ngo = await NGO.findById(event.hostNGO);
        const isFounder = ngo.founderId.toString() === req.user._id.toString();
        const member = ngo.members.find(m => m.userId.toString() === req.user._id.toString());
        const canEdit = isFounder || (member && member.permissions.canCreateEvents);

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this event'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating event'
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (NGO founders/admins only)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Check permission - only founder or admin can delete
        const ngo = await NGO.findById(event.hostNGO);
        const isFounder = ngo.founderId.toString() === req.user._id.toString();
        const member = ngo.members.find(m => m.userId.toString() === req.user._id.toString());
        const canDelete = isFounder || (member && member.role === 'admin');

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                error: 'Only NGO founder or admin can delete events'
            });
        }

        await event.deleteOne();

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting event'
        });
    }
};

// @desc    Register user for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Check if registration is open
        if (!event.isRegistrationOpen()) {
            return res.status(400).json({
                success: false,
                error: 'Registration is closed for this event'
            });
        }

        // Check if already registered
        const alreadyRegistered = event.registeredAttendees.some(
            attendee => attendee.userId.toString() === req.user._id.toString()
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                error: 'You are already registered for this event'
            });
        }

        // Add user to attendees
        event.registeredAttendees.push({
            userId: req.user._id,
            status: 'registered'
        });

        await event.save();

        res.json({
            success: true,
            message: 'Successfully registered for event',
            data: event
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error registering for event'
        });
    }
};

// @desc    Add collaborating NGO to event
// @route   POST /api/events/:id/collaborate
// @access  Private (NGO founder only)
exports.addCollaborator = async (req, res) => {
    try {
        const { ngoId } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        // Only host NGO founder can add collaborators
        const ngo = await NGO.findById(event.hostNGO);
        if (ngo.founderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only the host NGO founder can add collaborators'
            });
        }

        // Check if NGO exists and has approved collaboration
        const collaboratingNGO = await NGO.findById(ngoId);
        if (!collaboratingNGO) {
            return res.status(404).json({
                success: false,
                error: 'Collaborating NGO not found'
            });
        }

        // Check if already added
        if (event.collaboratingNGOs.includes(ngoId)) {
            return res.status(400).json({
                success: false,
                error: 'This NGO is already a collaborator'
            });
        }

        event.collaboratingNGOs.push(ngoId);
        await event.save();

        res.json({
            success: true,
            message: 'Collaborator added successfully',
            data: event
        });
    } catch (error) {
        console.error('Add collaborator error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error adding collaborator'
        });
    }
};
