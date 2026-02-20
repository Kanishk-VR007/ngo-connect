const EventRequest = require('../models/EventRequest');
const NGO = require('../models/NGO');
const Event = require('../models/Event');

// @desc    Create event request
// @route   POST /api/event-requests
// @access  Private (authenticated users)
exports.createEventRequest = async (req, res) => {
    try {
        const {
            eventType,
            description,
            location,
            preferredDate,
            targetNGO,
            expectedAttendees,
            urgency
        } = req.body;

        const eventRequest = await EventRequest.create({
            requestedBy: req.user._id,
            eventType,
            description,
            location,
            preferredDate,
            targetNGO: targetNGO || null,
            expectedAttendees,
            urgency: urgency || 'medium'
        });

        await eventRequest.populate('requestedBy', 'name email phone');
        if (targetNGO) {
            await eventRequest.populate('targetNGO', 'name logo email');
        }

        res.status(201).json({
            success: true,
            data: eventRequest
        });
    } catch (error) {
        console.error('Create event request error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error creating event request'
        });
    }
};

// @desc    Get event requests
// @route   GET /api/event-requests
// @access  Private
exports.getEventRequests = async (req, res) => {
    try {
        const {
            status,
            eventType,
            city,
            state,
            urgency,
            lat,
            lng,
            radius = 50
        } = req.query;

        let query = {};

        // If user is regular user, show only their requests
        if (req.user.role === 'user') {
            query.requestedBy = req.user._id;
        }
        // If user is NGO member/founder, show requests for their NGO or open requests
        else if (req.user.role === 'ngo_founder' || req.user.role === 'ngo_member') {
            if (!req.user.ngoId) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not associated with any NGO'
                });
            }

            query.$or = [
                { targetNGO: req.user.ngoId },
                { targetNGO: null }, // Open requests
                { assignedTo: req.user.ngoId }
            ];
        }
        // Admin can see all
        else if (req.user.role === 'admin') {
            // No filter, see all
        }

        // Apply filters
        if (status) query.status = status;
        if (eventType) query.eventType = eventType;
        if (urgency) query.urgency = urgency;
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (state) query['location.state'] = new RegExp(state, 'i');

        // Geospatial query
        if (lat && lng) {
            query['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000
                }
            };
        }

        const eventRequests = await EventRequest.find(query)
            .populate('requestedBy', 'name email phone profilePicture')
            .populate('targetNGO', 'name logo')
            .populate('assignedTo', 'name logo')
            .populate('createdEvent', 'title startDate')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: eventRequests.length,
            data: eventRequests
        });
    } catch (error) {
        console.error('Get event requests error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching event requests'
        });
    }
};

// @desc    Get current user's event requests
// @route   GET /api/event-requests/my-requests
// @access  Private
exports.getMyEventRequests = async (req, res) => {
    try {
        const eventRequests = await EventRequest.find({ requestedBy: req.user._id })
            .populate('targetNGO', 'name logo')
            .populate('assignedTo', 'name logo email phone')
            .populate('createdEvent', 'title startDate location')
            .populate('respondedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: eventRequests.length,
            data: eventRequests
        });
    } catch (error) {
        console.error('Get my event requests error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching your event requests'
        });
    }
};

// @desc    Accept event request
// @route   PUT /api/event-requests/:id/accept
// @access  Private (NGO members/founders)
exports.acceptEventRequest = async (req, res) => {
    try {
        const { responseMessage } = req.body;
        const eventRequest = await EventRequest.findById(req.params.id);

        if (!eventRequest) {
            return res.status(404).json({
                success: false,
                error: 'Event request not found'
            });
        }

        if (eventRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Event request has already been responded to'
            });
        }

        // Verify user has permission
        if (!req.user.ngoId) {
            return res.status(403).json({
                success: false,
                error: 'You must be associated with an NGO to accept requests'
            });
        }

        // If request is targeted to a specific NGO, verify it's the user's NGO
        if (eventRequest.targetNGO && eventRequest.targetNGO.toString() !== req.user.ngoId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'This request is targeted to a different NGO'
            });
        }

        // Check if user has permission to accept (founder or member with permission)
        const ngo = await NGO.findById(req.user.ngoId);
        const isFounder = ngo.founderId.toString() === req.user._id.toString();
        const member = ngo.members.find(m => m.userId.toString() === req.user._id.toString());
        const canAccept = isFounder || (member && (member.role === 'admin' || member.permissions.canCreateEvents));

        if (!canAccept) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to accept event requests'
            });
        }

        eventRequest.status = 'accepted';
        eventRequest.assignedTo = req.user.ngoId;
        eventRequest.responseMessage = responseMessage || 'We will organize this event for you!';
        eventRequest.respondedBy = req.user._id;
        eventRequest.respondedAt = new Date();

        await eventRequest.save();

        await eventRequest.populate([
            { path: 'requestedBy', select: 'name email phone' },
            { path: 'assignedTo', select: 'name logo email phone' }
        ]);

        res.json({
            success: true,
            message: 'Event request accepted successfully',
            data: eventRequest
        });
    } catch (error) {
        console.error('Accept event request error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error accepting event request'
        });
    }
};

// @desc    Reject event request
// @route   PUT /api/event-requests/:id/reject
// @access  Private (NGO members/founders)
exports.rejectEventRequest = async (req, res) => {
    try {
        const { responseMessage } = req.body;
        const eventRequest = await EventRequest.findById(req.params.id);

        if (!eventRequest) {
            return res.status(404).json({
                success: false,
                error: 'Event request not found'
            });
        }

        if (eventRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Event request has already been responded to'
            });
        }

        // Verify user has permission
        if (!req.user.ngoId) {
            return res.status(403).json({
                success: false,
                error: 'You must be associated with an NGO to reject requests'
            });
        }

        // Check permissions
        const ngo = await NGO.findById(req.user.ngoId);
        const isFounder = ngo.founderId.toString() === req.user._id.toString();
        const member = ngo.members.find(m => m.userId.toString() === req.user._id.toString());
        const canReject = isFounder || (member && member.role === 'admin');

        if (!canReject) {
            return res.status(403).json({
                success: false,
                error: 'Only NGO founder or admin can reject requests'
            });
        }

        eventRequest.status = 'rejected';
        eventRequest.responseMessage = responseMessage || 'Unfortunately, we cannot accept this request at this time.';
        eventRequest.respondedBy = req.user._id;
        eventRequest.respondedAt = new Date();

        await eventRequest.save();

        res.json({
            success: true,
            message: 'Event request rejected',
            data: eventRequest
        });
    } catch (error) {
        console.error('Reject event request error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error rejecting event request'
        });
    }
};

// @desc    Update event request
// @route   PUT /api/event-requests/:id
// @access  Private (requester only)
exports.updateEventRequest = async (req, res) => {
    try {
        const eventRequest = await EventRequest.findById(req.params.id);

        if (!eventRequest) {
            return res.status(404).json({
                success: false,
                error: 'Event request not found'
            });
        }

        // Only the requester can update
        if (eventRequest.requestedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own event requests'
            });
        }

        // Can only update if still pending
        if (eventRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update request that has been responded to'
            });
        }

        const updatedRequest = await EventRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedRequest
        });
    } catch (error) {
        console.error('Update event request error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating event request'
        });
    }
};

// @desc    Delete event request
// @route   DELETE /api/event-requests/:id
// @access  Private (requester or admin only)
exports.deleteEventRequest = async (req, res) => {
    try {
        const eventRequest = await EventRequest.findById(req.params.id);

        if (!eventRequest) {
            return res.status(404).json({
                success: false,
                error: 'Event request not found'
            });
        }

        // Only requester or admin can delete
        const isRequester = eventRequest.requestedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isRequester && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own event requests'
            });
        }

        await eventRequest.deleteOne();

        res.json({
            success: true,
            message: 'Event request deleted successfully'
        });
    } catch (error) {
        console.error('Delete event request error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting event request'
        });
    }
};
