const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const analyticsController = require('../controllers/analyticsController');

// @route   GET /api/analytics/ngo/:ngoId
// @desc    Get analytics for specific NGO
// @access  Private (NGO Member, Admin)
router.get('/ngo/:ngoId', auth, authorize('ngo_member', 'admin'), analyticsController.getNGOAnalytics);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);

module.exports = router;
