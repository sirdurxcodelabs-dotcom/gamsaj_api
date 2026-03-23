const mongoose = require('mongoose');

const navigationGroupSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      immutable: true, // Key stays immutable for reference
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['single', 'dropdown'],
      required: true,
      // Removed immutable - now editable
    },
    path: {
      type: String,
      trim: true,
      // Only for single type groups (like HOME, ABOUT, CONTACT)
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for ordering
navigationGroupSchema.index({ order: 1 });

// Validation: Warn about type changes
navigationGroupSchema.pre('save', function () {
  // If changing from dropdown to single, warn but allow
  if (this.isModified('type')) {
    console.warn(`⚠️  WARNING: Changing type of "${this.title}" from ${this.type} - this may affect frontend`);
  }
  
  // Single type must have path
  if (this.type === 'single' && !this.path) {
    throw new Error('Single type navigation groups must have a path');
  }
});

module.exports = mongoose.model('NavigationGroup', navigationGroupSchema);
