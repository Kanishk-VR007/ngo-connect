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

// @desc    Create new NGO (general endpoint)
exports.createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);

    // Update the founder's user document with NGO info
    const founderId = req.body.founderId || req.user._id;
    await User.findByIdAndUpdate(founderId, {
      ngoId: ngo._id,
      ngoRole: 'founder',
      role: 'ngo_founder'
    });

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

// @desc    Create NGO as a registered ngo_founder (separate dedicated endpoint)
// @route   POST /api/ngos/founder/create
// @access  Private (ngo_founder only)
exports.createNGOByFounder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only ngo_founder role can create via this endpoint
    if (req.user.role !== 'ngo_founder' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only NGO founders can create an NGO via this endpoint'
      });
    }

    // Check if user already has an NGO
    if (req.user.ngoId) {
      return res.status(400).json({
        success: false,
        error: 'You already have an NGO registered'
      });
    }

    const {
      name, description, registrationNumber, ngoType,
      email, phone, website, foundedYear, teamSize,
      serviceCategories, customServiceCategory,
      location, socialMedia, logo
    } = req.body;

    // Validate required location fields
    if (!location || !location.address || !location.city || !location.state) {
      return res.status(400).json({
        success: false,
        error: 'Location details (address, city, state) are required'
      });
    }

    // If coordinates not provided, geocode the address
    let coords = location.coordinates;
    if (!coords || !coords[0] || !coords[1]) {
      try {
        const addressStr = `${location.address}, ${location.city}, ${location.state}, India`;
        const geo = await geocodeAddress(addressStr);
        coords = [geo.lng, geo.lat];
      } catch (geoErr) {
        coords = [0, 0]; // fallback
      }
    }

    const ngoData = {
      name,
      description,
      registrationNumber,
      founderId: userId,
      ngoType: ngoType || 'Service',
      email,
      phone,
      website: website || '',
      foundedYear,
      teamSize: teamSize || 1,
      serviceCategories: serviceCategories || [],
      customServiceCategory: customServiceCategory || '',
      location: {
        ...location,
        coordinates: coords
      },
      socialMedia: socialMedia || {},
      logo: logo || '',
      members: [{
        userId: userId,
        role: 'founder',
        permissions: {
          canManageMembers: true,
          canEditNGOInfo: true,
          canCreateEvents: true,
          canManageCollaborations: true
        }
      }]
    };

    const ngo = await NGO.create(ngoData);

    // Update the founder's user document – founder credentials ALWAYS stay with the founder
    await User.findByIdAndUpdate(userId, {
      ngoId: ngo._id,
      ngoRole: 'founder',
      role: 'ngo_founder',
      membershipStatus: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'NGO created successfully! You are now the founder.',
      data: ngo
    });
  } catch (error) {
    console.error('Create NGO by founder error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      return res.status(400).json({
        success: false,
        error: `An NGO with this ${field === 'registrationNumber' ? 'registration number' : field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating NGO'
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

// @desc    Apply to become NGO member (stores in embedded NGO.memberApplications + updates User)
// @route   POST /api/ngos/:id/apply
// @access  Private (any authenticated user)
exports.applyToNGO = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Cannot apply if already an NGO founder or member of another NGO
    if (req.user.role === 'ngo_founder') {
      return res.status(400).json({ success: false, error: 'NGO founders cannot apply to join another NGO' });
    }
    if (req.user.role === 'ngo_member' && req.user.ngoId && req.user.ngoId.toString() === req.params.id) {
      return res.status(400).json({ success: false, error: 'You are already a member of this NGO' });
    }

    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ success: false, error: 'NGO not found' });
    }

    // Check duplicate pending application
    const alreadyApplied = ngo.memberApplications.find(
      a => a.userId.toString() === userId.toString() && a.status === 'pending'
    );
    if (alreadyApplied) {
      return res.status(400).json({ success: false, error: 'You have already applied to this NGO' });
    }

    ngo.memberApplications.push({ userId, message: message || '', status: 'pending' });
    await ngo.save();

    // Update user membership status
    await User.findByIdAndUpdate(userId, {
      appliedNgoId: ngo._id,
      membershipStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Waiting for NGO approval.',
      data: { ngoId: ngo._id, ngoName: ngo.name, status: 'pending' }
    });
  } catch (error) {
    console.error('Apply to NGO error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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

// @desc    Handle application (approve/reject) using embedded memberApplications
// @route   PUT /api/ngos/:id/applications/:applicationId
// @access  Private (ngo_founder of this NGO, ngo_member with permission, or admin)
exports.handleApplication = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });

    // Only the founder or admin can approve/reject
    const isFounder = ngo.founderId.toString() === req.user._id.toString();
    const isNGOMember = req.user.ngoId && req.user.ngoId.toString() === req.params.id;
    if (!isFounder && !isNGOMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to manage applications' });
    }

    const application = ngo.memberApplications.id(req.params.applicationId);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Application already processed' });
    }

    application.status = status;
    await ngo.save();

    if (status === 'approved') {
      // Add to members array – members share similar roles but founder ownership stays with founderId
      const alreadyMember = ngo.members.find(m => m.userId.toString() === application.userId.toString());
      if (!alreadyMember) {
        ngo.members.push({
          userId: application.userId,
          role: 'member',
          permissions: { canManageMembers: false, canEditNGOInfo: false, canCreateEvents: true, canManageCollaborations: false }
        });
        await ngo.save();
      }

      // Update user – role becomes ngo_member; founder ownership (founderId in NGO) is NOT changed
      await User.findByIdAndUpdate(application.userId, {
        role: 'ngo_member',
        ngoRole: 'member',
        ngoId: ngo._id,
        membershipStatus: 'active',
        appliedNgoId: null
      });
    } else {
      await User.findByIdAndUpdate(application.userId, {
        membershipStatus: 'rejected',
        appliedNgoId: null
      });
    }

    res.json({
      success: true,
      message: `Application ${status}`,
      data: { applicationId: application._id, status }
    });
  } catch (error) {
    console.error('Handle application error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get pending applications for an NGO (for founder dashboard)
// @route   GET /api/ngos/:id/applications
// @access  Private (ngo_founder or ngo_member of this NGO)
exports.getApplications = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .populate('memberApplications.userId', 'name email phone profilePicture bio');
    if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });

    const isFounder = ngo.founderId.toString() === req.user._id.toString();
    const isMember = req.user.ngoId && req.user.ngoId.toString() === req.params.id;
    if (!isFounder && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { status } = req.query;
    const applications = status
      ? ngo.memberApplications.filter(a => a.status === status)
      : ngo.memberApplications;

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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
