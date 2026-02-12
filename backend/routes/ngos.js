const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/ngos
// @desc    Get all NGOs with filters
// @access  Public
router.get('/', ngoController.getNGOs);

// @route   GET /api/ngos/nearby
// @desc    Get nearby NGOs based on location
// @access  Public
router.get('/nearby', ngoController.getNearbyNGOs);

// @route   GET /api/ngos/search
// @desc    Search NGOs by name, description, or service
// @access  Public
router.get('/search', ngoController.searchNGOs);

// @route   GET /api/ngos/:id
// @desc    Get single NGO by ID
// @access  Public
router.get('/:id', ngoController.getNGOById);

// @route   POST /api/ngos
// @desc    Create new NGO
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), ngoController.createNGO);

// @route   PUT /api/ngos/:id
// @desc    Update NGO
// @access  Private (NGO Member, Admin)
router.put('/:id', auth, authorize('ngo_member', 'admin'), ngoController.updateNGO);

// @route   DELETE /api/ngos/:id
// @desc    Delete NGO
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), ngoController.deleteNGO);

// @route   POST /api/ngos/:id/apply
// @desc    Apply to become NGO member
// @access  Private
router.post('/:id/apply', auth, ngoController.applyToNGO);

// @route   GET /api/ngos/:id/applications
// @desc    Get applications for NGO
// @access  Private (NGO Member)
router.get('/:id/applications', auth, authorize('ngo_member', 'admin'), ngoController.getApplications);

// @route   PUT /api/ngos/:id/applications/:applicationId
// @desc    Approve/Reject NGO application
// @access  Private (NGO Member)
router.put('/:id/applications/:applicationId', auth, authorize('ngo_member', 'admin'), ngoController.handleApplication);

// @route   POST /api/ngos/:id/activities
// @desc    Add activity to NGO
// @access  Private (NGO Member)
router.post('/:id/activities', auth, authorize('ngo_member', 'admin'), ngoController.addActivity);

// @route   POST /api/ngos/:id/achievements
// @desc    Add achievement to NGO
// @access  Private (NGO Member)
router.post('/:id/achievements', auth, authorize('ngo_member', 'admin'), ngoController.addAchievement);

module.exports = router;
