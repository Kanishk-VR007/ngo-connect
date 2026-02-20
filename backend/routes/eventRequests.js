const express = require('express');
const router = express.Router();
const eventRequestController = require('../controllers/eventRequestController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.post('/', auth, eventRequestController.createEventRequest);
router.get('/', auth, eventRequestController.getEventRequests);
router.get('/my-requests', auth, eventRequestController.getMyEventRequests);
router.put('/:id', auth, eventRequestController.updateEventRequest);
router.delete('/:id', auth, eventRequestController.deleteEventRequest);
router.put('/:id/accept', auth, eventRequestController.acceptEventRequest);
router.put('/:id/reject', auth, eventRequestController.rejectEventRequest);

module.exports = router;
