const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requestController = require('../controllers/requestController');

// @route   GET /api/requests
// @desc    Get all service requests
// @access  Private
router.get('/', auth, requestController.getRequests);

// @route   GET /api/requests/:id
// @desc    Get single service request
// @access  Private
router.get('/:id', auth, requestController.getRequestById);

// @route   POST /api/requests
// @desc    Create service request
// @access  Private
router.post('/', auth, requestController.createRequest);

// @route   PUT /api/requests/:id
// @desc    Update service request
// @access  Private
router.put('/:id', auth, requestController.updateRequest);

// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private (NGO Member)
router.put('/:id/status', auth, requestController.updateRequestStatus);

// @route   POST /api/requests/:id/feedback
// @desc    Submit feedback for completed request
// @access  Private
router.post('/:id/feedback', auth, requestController.submitFeedback);

module.exports = router;
