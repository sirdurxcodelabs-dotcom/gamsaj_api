const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Notification Type
    type: {
      type: String,
      enum: [
        'calendar_event',      // Calendar event notification
        'event_reminder',      // Event reminder
        'event_overdue',       // Event is overdue
        'event_completed',     // Event completed
        'event_cancelled',     // Event cancelled
        'event_updated',       // Event updated
        'system',              // System notification
        'other'
      ],
      required: true,
    },
    
    // Title & Message
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    
    // Related Event
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CalendarEvent',
    },
    
    // Recipient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Sound Alert
    soundPlayed: {
      type: Boolean,
      default: false,
    },
    playedAt: {
      type: Date,
    },
    
    // Action Link
    actionUrl: {
      type: String,
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Expiry
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ eventId: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark sound as played
notificationSchema.methods.markSoundPlayed = function () {
  this.soundPlayed = true;
  this.playedAt = new Date();
  return this.save();
};

// Static method to create event notification
notificationSchema.statics.createEventNotification = async function (event, type, userId) {
  const titles = {
    calendar_event: `Event: ${event.title}`,
    event_reminder: `Reminder: ${event.title}`,
    event_overdue: `Overdue: ${event.title}`,
    event_completed: `Completed: ${event.title}`,
    event_cancelled: `Cancelled: ${event.title}`,
    event_updated: `Updated: ${event.title}`,
  };

  const messages = {
    calendar_event: `Event "${event.title}" is scheduled for ${event.startDate.toLocaleString()}`,
    event_reminder: `Event "${event.title}" starts at ${event.startDate.toLocaleString()}`,
    event_overdue: `Event "${event.title}" is overdue. It was due on ${event.endDate.toLocaleString()}`,
    event_completed: `Event "${event.title}" has been marked as completed`,
    event_cancelled: `Event "${event.title}" has been cancelled`,
    event_updated: `Event "${event.title}" has been updated`,
  };

  return this.create({
    type,
    title: titles[type] || `Event: ${event.title}`,
    message: messages[type] || `Event notification for ${event.title}`,
    eventId: event._id,
    userId,
    priority: event.priority || 'medium',
    actionUrl: `/apps/calendar?eventId=${event._id}`,
    metadata: {
      eventType: event.type,
      eventStatus: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
    },
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
