const mongoose = require('mongoose');

const navigationItemSchema = new mongoose.Schema(
  {
    groupKey: {
      type: String,
      required: true,
      ref: 'NavigationGroup',
      // Removed immutable - now can move between groups
      trim: true,
      lowercase: true,
    },
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
    path: {
      type: String,
      required: [true, 'Please provide a path'],
      immutable: true, // Path stays immutable - frontend contract
      trim: true,
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

// Compound index for grouping and ordering
navigationItemSchema.index({ groupKey: 1, order: 1 });

// Validation: Warn about group changes
navigationItemSchema.pre('save', function () {
  if (this.isModified('groupKey')) {
    console.warn(`⚠️  WARNING: Moving "${this.title}" to different group - verify frontend compatibility`);
  }
});

module.exports = mongoose.model('NavigationItem', navigationItemSchema);
