const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['contact', 'subscriber'],
      required: true,
    },
    // Contact Us fields
    fullName: {
      type: String,
      required: function () {
        return this.type === 'contact';
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: function () {
        return this.type === 'contact';
      },
    },
    company: {
      type: String,
    },
    subject: {
      type: String,
      required: function () {
        return this.type === 'contact';
      },
    },
    message: {
      type: String,
      required: function () {
        return this.type === 'contact';
      },
    },
    reasonForContact: {
      type: String,
      enum: ['General Inquiry', 'Support', 'Partnership', 'Feedback', 'Other'],
    },
    // Status tracking
    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'],
      default: 'new',
    },
    // Reply tracking
    replyCount: {
      type: Number,
      default: 0,
    },
    lastReplyAt: {
      type: Date,
    },
    lastReplyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Admin notes
    adminNotes: {
      type: String,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: {
      type: Date,
    },
    // Metadata
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
connectionSchema.index({ type: 1, status: 1 });
connectionSchema.index({ email: 1 });
connectionSchema.index({ createdAt: -1 });

// Virtual for checking if it's a contact
connectionSchema.virtual('isContact').get(function () {
  return this.type === 'contact';
});

// Virtual for checking if it's a subscriber
connectionSchema.virtual('isSubscriber').get(function () {
  return this.type === 'subscriber';
});

module.exports = mongoose.model('Connection', connectionSchema);
