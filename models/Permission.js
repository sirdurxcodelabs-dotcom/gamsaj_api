const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a permission name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['main', 'app', 'content', 'pages', 'admin'],
      required: true,
    },
    resource: {
      type: String,
      required: true, // e.g., 'dashboard', 'users', 'projects'
    },
    action: {
      type: String,
      enum: ['view', 'create', 'update', 'delete', 'manage', 'edit', 'export'],
      default: 'view',
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
permissionSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '_');
  }
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
