const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth, requireRole, requireNGOMember } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', auth, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);
router.post('/:id/register', auth, eventController.registerForEvent);
router.post('/:id/collaborate', auth, eventController.addCollaborator);

module.exports = router;
