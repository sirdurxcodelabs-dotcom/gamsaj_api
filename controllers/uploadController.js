// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { url: req.file.path, filename: req.file.filename, size: req.file.size },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload multiple files (max 10)
// @route   POST /api/upload/multiple
// @access  Private
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one file' });
    }
    const files = req.files.map((file) => ({ url: file.path, filename: file.filename, size: file.size }));
    res.status(200).json({ success: true, message: `${files.length} file(s) uploaded successfully`, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload / replace profile avatar
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const User = require('../models/User');
    const { cloudinary } = require('../config/cloudinary');

    // Delete old avatar from Cloudinary if it exists
    const user = await User.findById(req.user.id);
    if (user && user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (e) {
        console.warn('Could not delete old avatar:', e.message);
      }
    }

    // Save new avatar URL and public_id
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path, avatarPublicId: req.file.filename },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { url: req.file.path, publicId: req.file.filename, avatar: updatedUser.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload / replace digital signature
// @route   POST /api/upload/signature
// @access  Private
exports.uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a signature image' });
    }

    const User = require('../models/User');
    const { cloudinary } = require('../config/cloudinary');

    const user = await User.findById(req.user.id);
    if (user && user.signaturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.signaturePublicId);
      } catch (e) {
        console.warn('Could not delete old signature:', e.message);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { signature: req.file.path, signaturePublicId: req.file.filename },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Signature updated successfully',
      data: { url: req.file.path, publicId: req.file.filename, signature: updatedUser.signature },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
