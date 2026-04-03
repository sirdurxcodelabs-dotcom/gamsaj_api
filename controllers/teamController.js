const TeamMember = require('../models/TeamMember');
const { cloudinary } = require('../config/cloudinary');

// GET /api/team  (public)
exports.getAll = async (req, res) => {
  try {
    const { limit, active = 'true' } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    let query = TeamMember.find(filter).sort({ order: 1, createdAt: 1 });
    if (limit) query = query.limit(Number(limit));
    const members = await query;
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/team/:id
exports.getOne = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/team
exports.create = async (req, res) => {
  try {
    const count = await TeamMember.countDocuments();
    const member = await TeamMember.create({ ...req.body, order: req.body.order ?? count });
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/team/:id
exports.update = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/team/:id
exports.remove = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
    // Delete photo from Cloudinary if exists
    if (member.photoPublicId) {
      try { await cloudinary.uploader.destroy(member.photoPublicId); } catch {}
    }
    await member.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/team/reorder
exports.reorder = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    await Promise.all(items.map((item) => TeamMember.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ success: true, message: 'Reordered' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
