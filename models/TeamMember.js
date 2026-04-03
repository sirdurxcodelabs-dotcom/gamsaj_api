const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  photo: { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  facebook: { type: String, trim: true, default: '' },
  twitter: { type: String, trim: true, default: '' },
  instagram: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
