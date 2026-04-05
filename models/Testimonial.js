const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  designation: { type: String, trim: true, default: '' },
  photo: { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
  title: { type: String, trim: true, default: '' },
  text: { type: String, required: true, trim: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  // If true, this client's photo appears in the "satisfied clients" group image
  showAsSatisfiedClient: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
