const NGO = require('../models/NGO');
const ServiceRequest = require('../models/ServiceRequest');
const Donation = require('../models/Donation');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get NGO analytics
exports.getNGOAnalytics = async (req, res) => {
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

    // Get NGO details
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Service requests statistics
    const requestStats = await ServiceRequest.aggregate([
      { $match: { ngoId: new mongoose.Types.ObjectId(ngoId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly requests trend
    const monthlyRequests = await ServiceRequest.aggregate([
      {
        $match: {
          ngoId: new mongoose.Types.ObjectId(ngoId),
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { ngoId: new mongoose.Types.ObjectId(ngoId), status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Service category breakdown
    const categoryBreakdown = await ServiceRequest.aggregate([
      { $match: { ngoId: new mongoose.Types.ObjectId(ngoId) } },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Average rating
    const ratings = await ServiceRequest.aggregate([
      {
        $match: {
          ngoId: new mongoose.Types.ObjectId(ngoId),
          'feedback.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$feedback.rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ngoInfo: {
          name: ngo.name,
          statistics: ngo.statistics,
          rating: ngo.rating
        },
        requestStats: requestStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        monthlyRequests,
        donations: donationStats[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0 },
        categoryBreakdown,
        feedback: ratings[0] || { averageRating: 0, totalRatings: 0 }
      }
    });
  } catch (error) {
    console.error('Get NGO analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    let analytics = {};

    if (req.user.role === 'user') {
      // User dashboard
      const myRequests = await ServiceRequest.countDocuments({
        requestedBy: req.user.id
      });

      const myDonations = await Donation.aggregate([
        { $match: { donorId: new mongoose.Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const recentRequests = await ServiceRequest.find({
        requestedBy: req.user.id
      })
        .populate('ngoId', 'name logo')
        .sort({ createdAt: -1 })
        .limit(5);

      analytics = {
        totalRequests: myRequests,
        donations: myDonations[0] || { totalAmount: 0, count: 0 },
        recentRequests
      };
    } else if (req.user.role === 'ngo_member') {
      // NGO member dashboard
      const pendingRequests = await ServiceRequest.countDocuments({
        ngoId: req.user.ngoId,
        status: 'pending'
      });

      const completedRequests = await ServiceRequest.countDocuments({
        ngoId: req.user.ngoId,
        status: 'completed'
      });

      const monthlyDonations = await Donation.aggregate([
        {
          $match: {
            ngoId: req.user.ngoId,
            status: 'completed',
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const recentRequests = await ServiceRequest.find({
        ngoId: req.user.ngoId
      })
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      analytics = {
        pendingRequests,
        completedRequests,
        monthlyDonations: monthlyDonations[0]?.total || 0,
        recentRequests
      };
    } else if (req.user.role === 'admin') {
      // Admin dashboard
      const totalNGOs = await NGO.countDocuments({ isActive: true });
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalRequests = await ServiceRequest.countDocuments();
      const totalDonations = await Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      analytics = {
        totalNGOs,
        totalUsers,
        totalRequests,
        totalDonations: totalDonations[0]?.total || 0
      };
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
