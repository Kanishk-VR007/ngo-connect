const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const ngoMemberController = require('../controllers/ngoMemberController');
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/ngos
// @desc    Get all NGOs with filters
// @access  Public
router.get('/', ngoController.getNGOs);

// @route   GET /api/ngos/nearby
// @desc    Get nearby NGOs based on lat/lng coordinates
// @access  Public
router.get('/nearby', ngoController.getNearbyNGOs);

// @route   GET /api/ngos/by-address
// @desc    Search NGOs by address string + radius (geocodes via Nominatim)
// @access  Public
router.get('/by-address', ngoController.getByAddress);

// @route   GET /api/ngos/search
// @desc    Search NGOs by name, description, or service
// @access  Public
router.get('/search', ngoController.searchNGOs);

// @route   POST /api/ngos/founder/create
// @desc    Create NGO as a registered founder (popup after registration)
// @access  Private (ngo_founder only)
router.post('/founder/create', auth, ngoController.createNGOByFounder);

// @route   GET /api/ngos/:id
// @desc    Get single NGO by ID
// @access  Public
router.get('/:id', ngoController.getNGOById);

// @route   POST /api/ngos
// @desc    Create new NGO (admin)
// @access  Private (Admin)
router.post('/', auth, authorize('admin', 'ngo_founder'), ngoController.createNGO);

// @route   PUT /api/ngos/:id
// @desc    Update NGO
// @access  Private (NGO Member, Admin)
router.put('/:id', auth, authorize('ngo_member', 'ngo_founder', 'admin'), ngoController.updateNGO);

// @route   DELETE /api/ngos/:id
// @desc    Delete NGO
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), ngoController.deleteNGO);

// @route   POST /api/ngos/:id/apply
// @desc    Apply to become NGO member
// @access  Private (authenticated user)
router.post('/:id/apply', auth, ngoMemberController.applyToNGO);

// @route   GET /api/ngos/:id/applications
// @desc    Get pending applications for NGO (founder view)
// @access  Private (NGO Founder / Admin)
router.get('/:id/applications', auth, ngoController.getApplications);

// @route   PUT /api/ngos/:id/applications/:userId/approve
// @desc    Approve member application
// @access  Private (ngo_founder / admin)
router.put('/:id/applications/:userId/approve', auth, authorize('ngo_founder', 'admin'), ngoMemberController.approveApplication);

// @route   PUT /api/ngos/:id/applications/:userId/reject
// @desc    Reject member application
// @access  Private (ngo_founder / admin)
router.put('/:id/applications/:userId/reject', auth, authorize('ngo_founder', 'admin'), ngoMemberController.rejectApplication);

// Legacy: Approve/Reject via applicationId (kept for backward compat)
router.put('/:id/applications/:applicationId', auth, ngoController.handleApplication);

// @route   POST /api/ngos/:id/activities
// @desc    Add activity to NGO
// @access  Private (NGO Member)
router.post('/:id/activities', auth, authorize('ngo_member', 'ngo_founder', 'admin'), ngoController.addActivity);

// @route   POST /api/ngos/:id/achievements
// @desc    Add achievement to NGO
// @access  Private (NGO Member)
router.post('/:id/achievements', auth, authorize('ngo_member', 'ngo_founder', 'admin'), ngoController.addAchievement);

module.exports = router;
