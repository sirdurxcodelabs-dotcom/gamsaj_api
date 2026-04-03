const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');

class NotificationScheduler {
  constructor() {
    this.checkInterval = null;
  }

  // Start the notification scheduler
  start() {
    console.log('📅 Notification Scheduler started');
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkUpcomingEvents();
      this.check24HourUpdates();
    }, 5 * 60 * 1000);

    // Delay initial run until MongoDB is ready (wait up to 30s)
    const mongoose = require('mongoose');
    const runWhenReady = () => {
      if (mongoose.connection.readyState === 1) {
        this.checkUpcomingEvents();
        this.check24HourUpdates();
      } else {
        mongoose.connection.once('connected', () => {
          this.checkUpcomingEvents();
          this.check24HourUpdates();
        });
      }
    };
    // Give connection a moment to establish
    setTimeout(runWhenReady, 3000);
  }

  // Stop the scheduler
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      console.log('📅 Notification Scheduler stopped');
    }
  }

  // Check for upcoming events that need notifications
  async checkUpcomingEvents() {
    try {
      const now = new Date();
      
      // Find events that:
      // 1. Start in the future
      // 2. Haven't sent notification yet
      // 3. Are within the notification window
      const events = await CalendarEvent.find({
        startDate: { $gt: now },
        notificationSent: false,
        status: { $nin: ['completed', 'cancelled'] },
      }).populate('assignedTo', 'name email');

      for (const event of events) {
        const timeUntilEvent = event.startDate.getTime() - now.getTime();
        const minutesUntilEvent = Math.floor(timeUntilEvent / (1000 * 60));
        const notifyBefore = event.notifyBefore || 30; // Default 30 minutes

        // Check if it's time to send notification
        if (minutesUntilEvent <= notifyBefore && minutesUntilEvent > 0) {
          await this.sendEventNotification(event);
        }
      }
    } catch (error) {
      console.error('Error checking upcoming events:', error);
    }
  }

  // Send notification for an event
  async sendEventNotification(event) {
    try {
      // Mark notification as sent
      event.notificationSent = true;
      await event.save();

      // Create notifications for assigned users
      const userIds = event.assignedTo && event.assignedTo.length > 0 
        ? event.assignedTo.map(u => u._id || u)
        : [event.createdBy];

      for (const userId of userIds) {
        await Notification.createEventNotification(event, 'event_reminder', userId);
      }

      console.log(`✅ Notification sent for event: ${event.title}`);
    } catch (error) {
      console.error(`Error sending notification for event ${event._id}:`, error);
    }
  }

  // Check for events that are 24 hours old and send update notifications
  async check24HourUpdates() {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find events that:
      // 1. Started 24 hours ago
      // 2. Are not completed or cancelled
      const events = await CalendarEvent.find({
        startDate: {
          $gte: new Date(twentyFourHoursAgo.getTime() - 5 * 60 * 1000), // 5 min buffer
          $lte: new Date(twentyFourHoursAgo.getTime() + 5 * 60 * 1000),
        },
        status: { $nin: ['completed', 'cancelled'] },
      }).populate('assignedTo', 'name email');

      for (const event of events) {
        await this.send24HourUpdate(event);
      }
    } catch (error) {
      console.error('Error checking 24-hour updates:', error);
    }
  }

  // Send 24-hour update notification
  async send24HourUpdate(event) {
    try {
      const userIds = event.assignedTo && event.assignedTo.length > 0 
        ? event.assignedTo.map(u => u._id || u)
        : [event.createdBy];

      // Calculate completion status
      const totalTasks = event.tasks ? event.tasks.length : 0;
      const completedTasks = event.tasks ? event.tasks.filter(t => t.completed).length : 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const message = totalTasks > 0
        ? `24-hour update: ${completedTasks}/${totalTasks} tasks completed (${completionRate}%)`
        : '24-hour update: Please update the event status';

      for (const userId of userIds) {
        await Notification.create({
          type: 'event_reminder',
          title: `24-Hour Update: ${event.title}`,
          message,
          eventId: event._id,
          userId,
          priority: event.priority || 'medium',
          actionUrl: `/apps/calendar?eventId=${event._id}`,
          metadata: {
            eventType: event.type,
            eventStatus: event.status,
            totalTasks,
            completedTasks,
            completionRate,
          },
        });
      }

      console.log(`✅ 24-hour update sent for event: ${event.title}`);
    } catch (error) {
      console.error(`Error sending 24-hour update for event ${event._id}:`, error);
    }
  }

  // Check for overdue events
  async checkOverdueEvents() {
    try {
      const now = new Date();

      const overdueEvents = await CalendarEvent.find({
        endDate: { $lt: now },
        status: { $nin: ['completed', 'cancelled', 'missed'] },
      }).populate('assignedTo', 'name email');

      for (const event of overdueEvents) {
        // Mark as missed if not completed
        if (event.status !== 'completed') {
          event.status = 'missed';
          await event.save();

          // Send overdue notification
          const userIds = event.assignedTo && event.assignedTo.length > 0 
            ? event.assignedTo.map(u => u._id || u)
            : [event.createdBy];

          for (const userId of userIds) {
            await Notification.createEventNotification(event, 'event_overdue', userId);
          }
        }
      }
    } catch (error) {
      console.error('Error checking overdue events:', error);
    }
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;
