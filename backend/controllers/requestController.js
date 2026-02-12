const ServiceRequest = require('../models/ServiceRequest');
const NGO = require('../models/NGO');

// @desc    Get all service requests
exports.getRequests = async (req, res) => {
  try {
    const { status, ngoId } = req.query;

    let query = {};

    // If user is normal user, show only their requests
    if (req.user.role === 'user') {
      query.requestedBy = req.user.id;
    }
    // If user is NGO member, show requests for their NGO
    else if (req.user.role === 'ngo_member' && req.user.ngoId) {
      query.ngoId = req.user.ngoId;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (ngoId && req.user.role === 'admin') {
      query.ngoId = ngoId;
    }

    const requests = await ServiceRequest.find(query)
      .populate('requestedBy', 'name email phone')
      .populate('ngoId', 'name logo email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single service request
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('ngoId', 'name logo email phone location')
      .populate('assignedTo', 'name email phone');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'user' &&
      request.requestedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (
      req.user.role === 'ngo_member' &&
      request.ngoId._id.toString() !== req.user.ngoId.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create service request
exports.createRequest = async (req, res) => {
  try {
    const { ngoId, serviceCategory, title, description, urgency, location, contactInfo } = req.body;

    // Verify NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    const request = await ServiceRequest.create({
      requestedBy: req.user.id,
      ngoId,
      serviceCategory,
      title,
      description,
      urgency,
      location,
      contactInfo
    });

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate('requestedBy', 'name email phone')
      .populate('ngoId', 'name logo email phone');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update service request
exports.updateRequest = async (req, res) => {
  try {
    let request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Only requester can update
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Can only update if status is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update request that is already being processed'
      });
    }

    request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ngoId', 'name logo');

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update request status (NGO members only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, responseNotes, assignedTo } = req.body;

    let request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check if user is member of the NGO
    if (
      req.user.role !== 'admin' &&
      request.ngoId.toString() !== req.user.ngoId.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    request.status = status;
    if (responseNotes) request.responseNotes = responseNotes;
    if (assignedTo) request.assignedTo = assignedTo;
    if (status === 'completed') request.completionDate = Date.now();

    await request.save();

    // Update NGO statistics
    if (status === 'completed') {
      await NGO.findByIdAndUpdate(request.ngoId, {
        $inc: { 'statistics.peopleHelped': 1, 'statistics.projectsCompleted': 1 }
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Only requester can submit feedback
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Request must be completed
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only submit feedback for completed requests'
      });
    }

    request.feedback = {
      rating,
      comment,
      submittedAt: Date.now()
    };

    await request.save();

    // Update NGO rating
    const ngo = await NGO.findById(request.ngoId);
    const totalRating = ngo.rating.average * ngo.rating.count + rating;
    ngo.rating.count += 1;
    ngo.rating.average = totalRating / ngo.rating.count;
    await ngo.save();

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
