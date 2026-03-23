const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.roleId = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .populate('roleId', 'name slug isActive')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    const formatted = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.roleId ? { _id: user.roleId._id, name: user.roleId.name, slug: user.roleId.slug } : null,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId', 'name slug permissions isActive')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId ? { _id: user.roleId._id, name: user.roleId.name, slug: user.roleId.slug } : null,
        permissions: user.permissions,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (create_users or manage_users)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, roleId, permissions } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Selected role does not exist. Please choose a valid role.' });
    }
    if (!role.isActive) {
      return res.status(400).json({ success: false, message: 'Selected role is inactive. Please choose an active role.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      roleId,
      permissions: permissions || [],
      isVerified: true,
    });

    await user.populate('roleId', 'name slug');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: { _id: user.roleId._id, name: user.roleId.name, slug: user.roleId.slug },
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { password, permissions, roleId, ...safeFields } = req.body;
    const updateData = { ...safeFields };

    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) return res.status(404).json({ success: false, message: 'Selected role does not exist.' });
      if (!role.isActive) return res.status(400).json({ success: false, message: 'Selected role is inactive.' });
      updateData.roleId = roleId;
    }

    // Only allow permission updates if caller is super-admin
    if (permissions !== undefined && req.userRole?.slug === 'super-admin') {
      updateData.permissions = permissions;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('roleId', 'name slug')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId ? { _id: user.roleId._id, name: user.roleId.name, slug: user.roleId.slug } : null,
        permissions: user.permissions,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active/inactive
// @route   PUT /api/users/:id/toggle-active
// @access  Private
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId', 'slug');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent deactivating super-admin
    if (user.roleId?.slug === 'super-admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate a Super Admin account.' });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { _id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId', 'slug');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.roleId?.slug === 'super-admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin users.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'roleId', select: 'name slug permissions' })
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        avatar: user.avatar || '',
        roleId: user.roleId._id,
        role: { name: user.roleId.name, slug: user.roleId.slug, permissions: user.permissions },
        socialMedia: {
          facebook: user.socialMedia?.facebook || '',
          twitter: user.socialMedia?.twitter || '',
          instagram: user.socialMedia?.instagram || '',
          linkedin: user.socialMedia?.linkedin || '',
        },
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio, website, socialMedia } = req.body;

    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email is already in use' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (socialMedia) updateData.socialMedia = socialMedia;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true })
      .populate({ path: 'roleId', select: 'name slug permissions' })
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone || '', location: user.location || '',
        bio: user.bio || '', website: user.website || '', avatar: user.avatar || '',
        roleId: user.roleId._id,
        role: { name: user.roleId.name, slug: user.roleId.slug, permissions: user.permissions },
        socialMedia: {
          facebook: user.socialMedia?.facebook || '', twitter: user.socialMedia?.twitter || '',
          instagram: user.socialMedia?.instagram || '', linkedin: user.socialMedia?.linkedin || '',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send security notification email (no password in email)
    try {
      const sendEmail = require('../config/email');
      const changedAt = new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'short' });
      await sendEmail({
        to: user.email,
        subject: 'Security Alert: Your Password Was Changed',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#1a73e8">Password Changed Successfully</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your account password was changed on <strong>${changedAt} UTC</strong>.</p>
            <p>If you made this change, no further action is needed.</p>
            <p style="color:#dc3545"><strong>If you did NOT make this change</strong>, please contact support immediately and reset your password.</p>
            <hr/>
            <p style="color:#888;font-size:13px">GAMSAJ International Limited &mdash; Security Team</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('Security email failed:', emailErr.message);
    }

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
