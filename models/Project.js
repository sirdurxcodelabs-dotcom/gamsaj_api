const mongoose = require('mongoose');

const projectUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['progress-update', 'issue', 'milestone', 'note'],
      default: 'progress-update',
    },
    images: [{ url: { type: String }, publicId: { type: String, default: '' } }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '', maxlength: 500 },
    category: {
      type: String,
      enum: ['construction', 'infrastructure', 'real-estate', 'industrial', 'other'],
      default: 'construction',
    },
    location: { type: String, default: '' },
    clientName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'on-hold', 'completed', 'cancelled'],
      default: 'planned',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    startDate: { type: Date },
    endDate: { type: Date },
    expectedCompletionDate: { type: Date },
    progressPercent: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    featuredImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    galleryImages: [{ url: String, publicId: String }],
    documents: [{ name: String, url: String, publicId: String }],
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublishedToWebsite: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    updates: [projectUpdateSchema],
  },
  { timestamps: true }
);

// Auto-generate slug from title
projectSchema.pre('save', async function () {
  if (!this.isModified('title') && this.slug) return;
  let base = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  let slug = base;
  let count = 1;
  while (await mongoose.model('Project').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${count++}`;
  }
  this.slug = slug;
});

// Only allow publishing if completed
projectSchema.pre('save', function () {
  if (this.isPublishedToWebsite && this.status !== 'completed') {
    this.isPublishedToWebsite = false;
  }
});

projectSchema.index({ slug: 1 });
projectSchema.index({ status: 1, isPublishedToWebsite: 1 });
projectSchema.index({ assignedUsers: 1 });

module.exports = mongoose.model('Project', projectSchema);
