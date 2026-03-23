const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide a blog excerpt'],
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    featuredImage: {
      url: {
        type: String,
        required: [true, 'Please provide a featured image'],
      },
      publicId: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Construction', 'Architecture', 'Business', 'Engineering', 'Building', 'Legal', 'Project Management', 'Other'],
      default: 'Construction',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [{
      author: String,
      email: String,
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isApproved: {
        type: Boolean,
        default: true, // Auto-approve comments for now
      },
      reactions: {
        like: { type: Number, default: 0 },
        heart: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
      },
      userReactions: [{
        userIP: String,
        reaction: String, // 'like', 'heart', 'laugh', 'wow', 'sad', 'angry'
        createdAt: { type: Date, default: Date.now }
      }]
    }],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from title before saving
blogSchema.pre('save', async function () {
  if (this.isModified('title')) {
    const base = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // Only set slug on new documents; updates are handled in the controller
    if (this.isNew) {
      const existing = await this.constructor.findOne({ slug: base, _id: { $ne: this._id } });
      this.slug = existing ? `${base}-${Date.now()}` : base;
    }
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Indexes
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });

// Virtual for comment count
blogSchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Method to increment views
blogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to add comment
blogSchema.methods.addComment = function (commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to add reaction to comment
blogSchema.methods.addCommentReaction = function (commentId, reaction, userIP) {
  const comment = this.comments.id(commentId);
  if (!comment) return null;

  // Check if user already reacted
  const existingReaction = comment.userReactions.find(ur => ur.userIP === userIP);
  
  if (existingReaction) {
    // Remove old reaction count
    if (comment.reactions[existingReaction.reaction] > 0) {
      comment.reactions[existingReaction.reaction] -= 1;
    }
    
    // Update to new reaction
    existingReaction.reaction = reaction;
    existingReaction.createdAt = new Date();
  } else {
    // Add new user reaction
    comment.userReactions.push({ userIP, reaction });
  }
  
  // Increment new reaction count
  comment.reactions[reaction] += 1;
  
  return this.save();
};

// Method to remove reaction from comment
blogSchema.methods.removeCommentReaction = function (commentId, userIP) {
  const comment = this.comments.id(commentId);
  if (!comment) return null;

  const existingReaction = comment.userReactions.find(ur => ur.userIP === userIP);
  if (existingReaction) {
    // Remove reaction count
    if (comment.reactions[existingReaction.reaction] > 0) {
      comment.reactions[existingReaction.reaction] -= 1;
    }
    
    // Remove user reaction
    comment.userReactions = comment.userReactions.filter(ur => ur.userIP !== userIP);
  }
  
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);