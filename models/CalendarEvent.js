const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    
    // Event Type
    type: {
      type: String,
      enum: [
        'project',           // Construction project
        'meeting',           // Meeting/Discussion
        'deadline',          // Project deadline
        'inspection',        // Site inspection
        'delivery',          // Material delivery
        'legal',             // Legal/Compliance matter
        'permit',            // Permit/License deadline
        'maintenance',       // Maintenance work
        'other'
      ],
      required: true,
      default: 'project',
    },
    
    // Date & Time
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    isMultiDay: {
      type: Boolean,
      default: false,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed', 'missed', 'snoozed', 'cancelled'],
      default: 'pending',
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Location
    location: {
      type: String,
      trim: true,
    },
    
    // Project/Legal Reference
    projectReference: {
      type: String,
      trim: true,
    },
    legalReference: {
      type: String,
      trim: true,
    },
    
    // Participants
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Reminders
    reminders: [{
      time: {
        type: Number, // Minutes before event
        required: true,
      },
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    }],
    
    // Notifications
    notifyBefore: {
      type: Number, // Minutes before event
      default: 30,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    
    // Snooze
    snoozedUntil: {
      type: Date,
    },
    snoozeCount: {
      type: Number,
      default: 0,
    },
    
    // Recurrence
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: Number, // Every X days/weeks/months
      endDate: Date,
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    },
    
    // Attachments
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      uploadedAt: Date,
    }],
    
    // Tasks
    tasks: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      order: {
        type: Number,
        default: 0,
      },
    }],
    
    // Notes
    notes: {
      type: String,
    },
    
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Color coding
    color: {
      type: String,
      default: '#007bff',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ status: 1 });
calendarEventSchema.index({ type: 1 });
calendarEventSchema.index({ assignedTo: 1 });
calendarEventSchema.index({ createdBy: 1 });

// Virtual for duration
calendarEventSchema.virtual('duration').get(function () {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)); // Days
});

// Method to check if event is overdue
calendarEventSchema.methods.isOverdue = function () {
  return this.endDate < new Date() && this.status !== 'completed' && this.status !== 'cancelled';
};

// Method to check if event is today
calendarEventSchema.methods.isToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.startDate >= today && this.startDate < tomorrow;
};

// Method to snooze event
calendarEventSchema.methods.snooze = function (minutes) {
  this.snoozedUntil = new Date(Date.now() + minutes * 60000);
  this.snoozeCount += 1;
  this.status = 'snoozed';
  return this.save();
};

// Method to mark as completed
calendarEventSchema.methods.markCompleted = function () {
  this.status = 'completed';
  return this.save();
};

// Method to mark as missed
calendarEventSchema.methods.markMissed = function () {
  this.status = 'missed';
  return this.save();
};

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
