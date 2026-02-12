const NGO = require('../models/NGO');
const NGOApplication = require('../models/NGOApplication');
const User = require('../models/User');

// @desc    Get all NGOs with filters
exports.getNGOs = async (req, res) => {
  try {
    const { category, city, state, verified, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.serviceCategories = category;
    }
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    const skip = (page - 1) * limit;

    const ngos = await NGO.find(query)
      .select('-members -activities -achievements')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'rating.average': -1, createdAt: -1 });

    const total = await NGO.countDocuments(query);

    res.json({
      success: true,
      count: ngos.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: ngos
    });
  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get nearby NGOs
exports.getNearbyNGOs = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    const query = {
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (category) {
      query.serviceCategories = category;
    }

    const ngos = await NGO.find(query)
      .select('-members -activities -achievements')
      .limit(20);

    res.json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('Get nearby NGOs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search NGOs
exports.searchNGOs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }

    const ngos = await NGO.find({
      $text: { $search: q },
      isActive: true
    })
      .select('-members -activities -achievements')
      .limit(20);

    res.json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('Search NGOs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single NGO
exports.getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .populate('members.userId', 'name email profilePicture');

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    res.json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Get NGO error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new NGO
exports.createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);

    res.status(201).json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Create NGO error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'NGO with this registration number or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update NGO
exports.updateNGO = async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Check if user is member of this NGO or admin
    if (req.user.role !== 'admin' && (!req.user.ngoId || req.user.ngoId.toString() !== ngo._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this NGO'
      });
    }

    ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Update NGO error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete NGO
exports.deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    await ngo.deleteOne();

    res.json({
      success: true,
      message: 'NGO deleted successfully'
    });
  } catch (error) {
    console.error('Delete NGO error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Apply to become NGO member
exports.applyToNGO = async (req, res) => {
  try {
    const { message, position, skills, availability } = req.body;

    // Check if NGO exists
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Check if user already applied
    const existingApplication = await NGOApplication.findOne({
      applicantId: req.user.id,
      ngoId: req.params.id,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this NGO'
      });
    }

    const application = await NGOApplication.create({
      applicantId: req.user.id,
      ngoId: req.params.id,
      message,
      position,
      skills,
      availability
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Apply to NGO error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get applications for NGO
exports.getApplications = async (req, res) => {
  try {
    const { status } = req.query;

    // Verify user is member of this NGO
    if (req.user.role !== 'admin' && (!req.user.ngoId || req.user.ngoId.toString() !== req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const query = { ngoId: req.params.id };
    if (status) {
      query.status = status;
    }

    const applications = await NGOApplication.find(query)
      .populate('applicantId', 'name email phone profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Handle application (approve/reject)
exports.handleApplication = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    // Verify user is member of this NGO
    if (req.user.role !== 'admin' && (!req.user.ngoId || req.user.ngoId.toString() !== req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const application = await NGOApplication.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Application has already been processed'
      });
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    await application.save();

    // If approved, add user to NGO members and update user role
    if (status === 'approved') {
      const ngo = await NGO.findById(req.params.id);
      ngo.members.push({
        userId: application.applicantId,
        role: 'member'
      });
      await ngo.save();

      await User.findByIdAndUpdate(application.applicantId, {
        role: 'ngo_member',
        ngoId: req.params.id
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Handle application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add activity to NGO
exports.addActivity = async (req, res) => {
  try {
    // Verify user is member of this NGO
    if (req.user.role !== 'admin' && (!req.user.ngoId || req.user.ngoId.toString() !== req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    ngo.activities.push(req.body);
    await ngo.save();

    res.json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add achievement to NGO
exports.addAchievement = async (req, res) => {
  try {
    // Verify user is member of this NGO
    if (req.user.role !== 'admin' && (!req.user.ngoId || req.user.ngoId.toString() !== req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    ngo.achievements.push(req.body);
    await ngo.save();

    res.json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
