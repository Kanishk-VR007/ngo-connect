const NGO = require('../models/NGO');
const NGOApplication = require('../models/NGOApplication');
const User = require('../models/User');
const https = require('https');

// Helper: Handle database errors
const handleDBError = (error, res, operation = 'operation') => {
  console.error(`Database error during ${operation}:`, error.message);
  
  if (error.message.includes('connect') || error.name === 'MongoServerError' || error.message.includes('ENOTFOUND')) {
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable. Please try again later.',
      retryAfter: 30
    });
  }
  
  return res.status(500).json({
    success: false,
    error: `Server error during ${operation}`
  });
};

// Helper: Geocode an address string → { lat, lng } using Nominatim (free, no key)
const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`;
    const options = {
      headers: { 'User-Agent': 'NGOConnectApp/1.0 (ngoconnect@example.com)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          } else {
            reject(new Error('Address not found'));
          }
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
};

// @desc    Get all NGOs with filters
exports.getNGOs = async (req, res) => {
  try {
    const { category, city, state, verified, search, page = 1, limit = 20 } = req.query;

    // Cap limit at 200 to prevent abuse but allow map view to fetch all
    const effectiveLimit = Math.min(parseInt(limit) || 20, 200);

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
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const skip = (page - 1) * effectiveLimit;

    try {
      const ngos = await NGO.find(query)
        .select('-members -activities -achievements')
        .limit(effectiveLimit)
        .skip(skip)
        .sort({ 'rating.average': -1, createdAt: -1 });

      const total = await NGO.countDocuments(query);

      res.json({
        success: true,
        count: ngos.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / effectiveLimit),
        data: ngos
      });
    } catch (dbError) {
      return handleDBError(dbError, res, 'fetching NGOs');
    }
  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};


// @desc    Get nearby NGOs by coordinates
exports.getNearbyNGOs = async (req, res) => {
  try {
    // Accept both lat/lng (from NGOList.js) and latitude/longitude
    const lat = req.query.lat || req.query.latitude;
    const lng = req.query.lng || req.query.longitude;
    // Accept 'distance' in km OR 'maxDistance' in meters
    const distanceKm = req.query.distance ? parseFloat(req.query.distance) : null;
    const maxDistanceMeters = distanceKm
      ? distanceKm * 1000
      : parseInt(req.query.maxDistance) || 50000; // default 50 km
    const { category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Please provide lat and lng'
      });
    }

    const query = {
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    };

    if (category) query.serviceCategories = category;

    try {
      const ngos = await NGO.find(query)
        .select('-members -activities -achievements')
        .limit(100);

      res.json({ success: true, count: ngos.length, data: ngos });
    } catch (dbError) {
      return handleDBError(dbError, res, 'fetching nearby NGOs');
    }
  } catch (error) {
    console.error('Get nearby NGOs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


// @desc    Search NGOs by address string + radius (geocodes address via Nominatim)
exports.getByAddress = async (req, res) => {
  try {
    const { address, radius = 50, category } = req.query;

    if (!address) {
      return res.status(400).json({ success: false, error: 'Please provide an address' });
    }

    // Geocode the address
    let coords;
    try {
      coords = await geocodeAddress(address);
    } catch (geoErr) {
      return res.status(400).json({ success: false, error: `Could not geocode address: ${geoErr.message}` });
    }

    const radiusMeters = parseFloat(radius) * 1000; // km → meters

    const query = {
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          },
          $maxDistance: radiusMeters
        }
      }
    };

    if (category) query.serviceCategories = category;

    const ngos = await NGO.find(query)
      .select('-members -activities -achievements')
      .limit(50);

    res.json({
      success: true,
      count: ngos.length,
      searchCenter: { lat: coords.lat, lng: coords.lng, address },
      radius: parseFloat(radius),
      data: ngos
    });
  } catch (error) {
    console.error('Get by address error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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
