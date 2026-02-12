const Donation = require('../models/Donation');
const NGO = require('../models/NGO');

// @desc    Get all donations
exports.getDonations = async (req, res) => {
  try {
    const { ngoId, status } = req.query;

    let query = {};

    // If user is normal user, show only their donations
    if (req.user.role === 'user') {
      query.donorId = req.user.id;
    }
    // If user is NGO member, show donations for their NGO
    else if (req.user.role === 'ngo_member' && req.user.ngoId) {
      query.ngoId = req.user.ngoId;
    }

    // Apply filters
    if (ngoId && req.user.role === 'admin') {
      query.ngoId = ngoId;
    }
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donorId', 'name email')
      .populate('ngoId', 'name logo')
      .sort({ createdAt: -1 });

    // Hide donor details if anonymous
    const sanitizedDonations = donations.map(donation => {
      const donationObj = donation.toObject();
      if (donationObj.isAnonymous && req.user.role !== 'admin') {
        donationObj.donorId = { name: 'Anonymous', email: 'anonymous@hidden.com' };
      }
      return donationObj;
    });

    res.json({
      success: true,
      count: sanitizedDonations.length,
      data: sanitizedDonations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single donation
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name logo email');

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'user' &&
      donation.donorId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create donation
exports.createDonation = async (req, res) => {
  try {
    const {
      ngoId,
      amount,
      currency,
      donationType,
      purpose,
      message,
      paymentMethod,
      isAnonymous
    } = req.body;

    // Verify NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Generate transaction ID (in real app, this would come from payment gateway)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const donation = await Donation.create({
      donorId: req.user.id,
      ngoId,
      amount,
      currency,
      donationType,
      purpose,
      message,
      paymentMethod,
      transactionId,
      status: 'completed', // In real app, would be 'pending' until payment confirmation
      isAnonymous
    });

    // Update NGO donation statistics
    await NGO.findByIdAndUpdate(ngoId, {
      $inc: { 'statistics.donationsReceived': amount }
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('ngoId', 'name logo email');

    res.status(201).json({
      success: true,
      data: populatedDonation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get donation statistics for NGO
exports.getDonationStats = async (req, res) => {
  try {
    const { ngoId } = req.params;

    // Verify authorization
    if (
      req.user.role === 'ngo_member' &&
      req.user.ngoId.toString() !== ngoId
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const stats = await Donation.aggregate([
      { $match: { ngoId: require('mongoose').Types.ObjectId(ngoId), status: 'completed' } },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          averageDonation: { $avg: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Donation.aggregate([
      {
        $match: {
          ngoId: require('mongoose').Types.ObjectId(ngoId),
          status: 'completed',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || { totalDonations: 0, donationCount: 0, averageDonation: 0 },
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
