const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Head Office' },
    fullAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'Nigeria' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const companyInfoSchema = new mongoose.Schema(
  {
    // Basic
    companyName: { type: String, default: 'GAMSAJ International Limited' },
    tagline: { type: String, default: '' },
    aboutText: { type: String, default: '' },
    rcNumber: { type: String, default: '965221' },
    foundedYear: { type: String, default: '2011' },

    // Contact
    phone: { type: String, default: '' },
    phoneSecondary: { type: String, default: '' },
    email: { type: String, default: '' },
    emailSupport: { type: String, default: '' },

    // Addresses (max 3)
    addresses: {
      type: [addressSchema],
      default: [],
      validate: {
        validator: (v) => v.length <= 3,
        message: 'Maximum of 3 addresses allowed.',
      },
    },

    // Working info
    workingDays: { type: String, default: 'Mon - Sat' },
    workingHours: { type: String, default: '8am - 5pm' },

    // Social media
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
