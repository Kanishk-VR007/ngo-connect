const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const donationController = require('../controllers/donationController');

// @route   GET /api/donations
// @desc    Get all donations
// @access  Private
router.get('/', auth, donationController.getDonations);

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private
router.get('/:id', auth, donationController.getDonationById);

// @route   POST /api/donations
// @desc    Create donation
// @access  Private
router.post('/', auth, donationController.createDonation);

// @route   GET /api/donations/ngo/:ngoId/stats
// @desc    Get donation statistics for NGO
// @access  Private
router.get('/ngo/:ngoId/stats', auth, donationController.getDonationStats);

module.exports = router;
