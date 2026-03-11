const NGO = require('../models/NGO');
const User = require('../models/User');

// @desc    Apply to become an NGO member
// @route   POST /api/ngos/:id/apply
// @access  Private (user)
exports.applyToNGO = async (req, res) => {
    try {
        const { message } = req.body;
        const ngoId = req.params.id;

        // Check if NGO exists
        const ngo = await NGO.findById(ngoId);
        if (!ngo) {
            return res.status(404).json({ success: false, error: 'NGO not found' });
        }

        // Prevent founder of same NGO from applying
        if (ngo.founderId && ngo.founderId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, error: 'You are the founder of this NGO' });
        }

        // Check if user already has a pending application to this NGO
        const alreadyApplied = ngo.memberApplications.some(
            (app) => app.userId.toString() === req.user._id.toString() && app.status === 'pending'
        );
        if (alreadyApplied) {
            return res.status(400).json({ success: false, error: 'You have already applied to this NGO' });
        }

        // Check if already a member
        const alreadyMember = ngo.members.some(
            (m) => m.userId.toString() === req.user._id.toString()
        );
        if (alreadyMember) {
            return res.status(400).json({ success: false, error: 'You are already a member of this NGO' });
        }

        // Add application to NGO
        ngo.memberApplications.push({
            userId: req.user._id,
            message: message || '',
            status: 'pending'
        });
        await ngo.save();

        // Update user's pending application info
        await User.findByIdAndUpdate(req.user._id, {
            appliedNgoId: ngoId,
            membershipStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: { ngoId, status: 'pending' }
        });
    } catch (error) {
        console.error('Apply to NGO error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Approve a member application
// @route   PUT /api/ngos/:id/applications/:userId/approve
// @access  Private (ngo_founder / admin)
exports.approveApplication = async (req, res) => {
    try {
        const { id: ngoId, userId: applicantId } = req.params;

        const ngo = await NGO.findById(ngoId);
        if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });

        // Only founder of this NGO or admin can approve
        const isOwner = ngo.founderId && ngo.founderId.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const application = ngo.memberApplications.find(
            (app) => app.userId.toString() === applicantId && app.status === 'pending'
        );
        if (!application) {
            return res.status(404).json({ success: false, error: 'Pending application not found' });
        }

        // Update application status
        application.status = 'approved';

        // Add user to members list
        const alreadyMember = ngo.members.some((m) => m.userId.toString() === applicantId);
        if (!alreadyMember) {
            ngo.members.push({ userId: applicantId, role: 'member' });
        }
        await ngo.save();

        // Update user role and membership status
        await User.findByIdAndUpdate(applicantId, {
            role: 'ngo_member',
            ngoId: ngoId,
            ngoRole: 'member',
            membershipStatus: 'active',
            appliedNgoId: null
        });

        res.json({ success: true, message: 'Application approved', data: { applicantId, ngoId } });
    } catch (error) {
        console.error('Approve application error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Reject a member application
// @route   PUT /api/ngos/:id/applications/:userId/reject
// @access  Private (ngo_founder / admin)
exports.rejectApplication = async (req, res) => {
    try {
        const { id: ngoId, userId: applicantId } = req.params;

        const ngo = await NGO.findById(ngoId);
        if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });

        // Only founder of this NGO or admin can reject
        const isOwner = ngo.founderId && ngo.founderId.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const application = ngo.memberApplications.find(
            (app) => app.userId.toString() === applicantId && app.status === 'pending'
        );
        if (!application) {
            return res.status(404).json({ success: false, error: 'Pending application not found' });
        }

        application.status = 'rejected';
        await ngo.save();

        // Update user's membership status
        await User.findByIdAndUpdate(applicantId, {
            membershipStatus: 'rejected',
            appliedNgoId: null
        });

        res.json({ success: true, message: 'Application rejected', data: { applicantId, ngoId } });
    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
