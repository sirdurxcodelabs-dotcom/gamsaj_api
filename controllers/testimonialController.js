const Testimonial = require('../models/Testimonial');
const { cloudinary } = require('../config/cloudinary');

// GET /api/testimonials  (public)
exports.getAll = async (req, res) => {
  try {
    const { active, satisfiedOnly } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (satisfiedOnly === 'true') { filter.showAsSatisfiedClient = true; filter.isActive = true; }
    const items = await Testimonial.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await Testimonial.countDocuments();
    const item = await Testimonial.create({ ...req.body, order: req.body.order ?? count });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    if (item.photoPublicId) {
      try { await cloudinary.uploader.destroy(item.photoPublicId); } catch {}
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
