const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    // Email metadata
    from: {
      name: String,
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
    },
    to: {
      name: String,
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
    },
    cc: [
      {
        name: String,
        email: String,
      },
    ],
    bcc: [
      {
        name: String,
        email: String,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    htmlBody: {
      type: String,
    },
    
    // Email type and folder
    type: {
      type: String,
      enum: ['inbox', 'sent', 'draft', 'spam'],
      default: 'inbox',
    },
    
    // Status flags
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    
    // Relationships
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection',
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
    },
    threadId: {
      type: String,
    },
    
    // Attachments
    attachments: [
      {
        filename: String,
        path: String,
        size: Number,
        mimetype: String,
      },
    ],
    
    // Metadata
    sentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    labels: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
emailSchema.index({ userId: 1, type: 1, isDeleted: 1 });
emailSchema.index({ 'from.email': 1 });
emailSchema.index({ 'to.email': 1 });
emailSchema.index({ isRead: 1, type: 1 });
emailSchema.index({ createdAt: -1 });
emailSchema.index({ threadId: 1 });

// Mark email as read
emailSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = Date.now();
  return this.save();
};

// Mark email as unread
emailSchema.methods.markAsUnread = function () {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Toggle star
emailSchema.methods.toggleStar = function () {
  this.isStarred = !this.isStarred;
  return this.save();
};

// Move to folder
emailSchema.methods.moveToFolder = function (folder) {
  this.type = folder;
  return this.save();
};

// Soft delete
emailSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

module.exports = mongoose.model('Email', emailSchema);
