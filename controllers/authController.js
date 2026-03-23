const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('../config/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Validate required fields
    if (!roleId) {
      return res.status(400).json({
        status: 'error',
        success: false,
        message: 'Role is required. Please select a valid role.',
      });
    }

    // Check if role exists in Roles table
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        status: 'error',
        success: false,
        message: 'Selected role does not exist. Please create or assign a valid role.',
      });
    }

    // Check if role is active
    if (!role.isActive) {
      return res.status(400).json({
        status: 'error',
        success: false,
        message: 'Selected role is inactive. Please choose an active role.',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        success: false,
        message: 'User already exists',
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user with validated roleId
    const user = await User.create({
      name,
      email,
      password,
      roleId,
      verificationToken,
    });

    // Populate role information
    await user.populate('roleId');

    // Send verification email (optional - won't fail registration if email fails)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Please verify your email by clicking: <a href="${verificationUrl}">Verify Email</a></p>`,
      });
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.log('⚠️ Email sending failed, but user was created:', emailError.message);
    }

    // Get combined permissions
    const permissions = [
      ...(role.permissions || []),
      ...(user.permissions || []),
    ];

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: role._id,
          name: role.name,
          slug: role.slug,
        },
        permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user and populate role
    const user = await User.findOne({ email }).select('+password').populate('roleId');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Check if role exists and is active
    if (!user.roleId) {
      return res.status(500).json({
        status: 'error',
        success: false,
        message: 'User role is not properly configured. Please contact administrator.',
      });
    }

    if (!user.roleId.isActive) {
      return res.status(403).json({
        status: 'error',
        success: false,
        message: 'Your assigned role is inactive. Please contact administrator.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Get combined permissions
    const permissions = [
      ...(user.roleId.permissions || []),
      ...(user.permissions || []),
    ];

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.roleId._id,
          name: user.roleId.name,
          slug: user.roleId.slug,
        },
        permissions,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('roleId');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        success: false,
        message: 'User not found',
      });
    }

    if (!user.roleId) {
      return res.status(500).json({
        status: 'error',
        success: false,
        message: 'User role is not properly configured',
      });
    }

    // Get combined permissions
    const permissions = [
      ...(user.roleId.permissions || []),
      ...(user.permissions || []),
    ];

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.roleId._id,
          name: user.roleId.name,
          slug: user.roleId.slug,
        },
        permissions,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#1a73e8">Reset Your Password</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We received a request to reset the password for your account (<strong>${user.email}</strong>).</p>
            <p>Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${resetUrl}" style="background:#1a73e8;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
                Reset Password
              </a>
            </div>
            <p>Or copy this link into your browser:</p>
            <p style="word-break:break-all;color:#555;font-size:13px">${resetUrl}</p>
            <p style="color:#dc3545"><strong>If you did not request a password reset</strong>, please ignore this email. Your password will remain unchanged.</p>
            <hr/>
            <p style="color:#888;font-size:13px">GAMSAJ International Limited &mdash; Security Team</p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      // Rollback the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Notify user that password was reset (no password in email)
    try {
      const resetAt = new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'short' });
      await sendEmail({
        to: user.email,
        subject: 'Your Password Has Been Reset',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#1a73e8">Password Reset Successful</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your password was successfully reset on <strong>${resetAt} UTC</strong>.</p>
            <p>You can now log in with your new password.</p>
            <p style="color:#dc3545"><strong>If you did NOT make this change</strong>, contact support immediately.</p>
            <hr/>
            <p style="color:#888;font-size:13px">GAMSAJ International Limited &mdash; Security Team</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('Reset confirmation email failed:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
