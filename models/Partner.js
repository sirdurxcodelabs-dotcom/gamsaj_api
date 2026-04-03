const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  website: { type: String, trim: true, default: '' },
  contactName: { type: String, trim: true, default: '' },
  contactEmail: { type: String, trim: true, default: '' },
  contactPhone: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
