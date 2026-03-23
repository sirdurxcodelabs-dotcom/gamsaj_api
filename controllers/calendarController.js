const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');

// @desc    Get all calendar events
// @route   GET /api/calendar/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      status,
      priority,
      assignedTo,
      page = 1,
      limit = 100,
    } = req.query;

    // Build query
    const query = {};

    // Filter by date range
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Pagination
    const skip = (page - 1) * limit;

    const events = await CalendarEvent.find(query)
      .sort({ startDate: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await CalendarEvent.countDocuments(query);

    // Get counts by status
    const statusCounts = await CalendarEvent.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/calendar/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message,
    });
  }
};

// @desc    Create new event
// @route   POST /api/calendar/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Calculate if multi-day
    const start = new Date(eventData.startDate);
    const end = new Date(eventData.endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    eventData.isMultiDay = daysDiff > 1;

    const event = await CalendarEvent.create(eventData);

    // Create notification for assigned users
    if (event.assignedTo && event.assignedTo.length > 0) {
      for (const userId of event.assignedTo) {
        await Notification.createEventNotification(event, 'calendar_event', userId);
      }
    }

    // Also notify creator
    await Notification.createEventNotification(event, 'calendar_event', req.user._id);

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/calendar/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    });

    event.updatedBy = req.user._id;

    // Recalculate if multi-day
    if (req.body.startDate || req.body.endDate) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      event.isMultiDay = daysDiff > 1;
    }

    await event.save();

    // Create notification for assigned users
    if (event.assignedTo && event.assignedTo.length > 0) {
      for (const userId of event.assignedTo) {
        await Notification.createEventNotification(event, 'event_updated', userId);
      }
    }

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/calendar/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
};

// @desc    Update event status
// @route   PUT /api/calendar/events/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'ongoing', 'completed', 'missed', 'snoozed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = status;
    event.updatedBy = req.user._id;
    await event.save();

    // Create notification based on status
    const notificationTypes = {
      completed: 'event_completed',
      cancelled: 'event_cancelled',
    };

    if (notificationTypes[status]) {
      if (event.assignedTo && event.assignedTo.length > 0) {
        for (const userId of event.assignedTo) {
          await Notification.createEventNotification(event, notificationTypes[status], userId);
        }
      }
    }

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: `Event marked as ${status}`,
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

// @desc    Snooze event
// @route   POST /api/calendar/events/:id/snooze
// @access  Private
exports.snoozeEvent = async (req, res) => {
  try {
    const { minutes = 30 } = req.body;

    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.snooze(minutes);

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Event snoozed for ${minutes} minutes`,
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error snoozing event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to snooze event',
      error: error.message,
    });
  }
};

// @desc    Get today's events
// @route   GET /api/calendar/events/today
// @access  Private
exports.getTodayEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await CalendarEvent.find({
      startDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $nin: ['completed', 'cancelled'] },
    })
      .sort({ startDate: 1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching today events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today events',
      error: error.message,
    });
  }
};

// @desc    Get overdue events
// @route   GET /api/calendar/events/overdue
// @access  Private
exports.getOverdueEvents = async (req, res) => {
  try {
    const now = new Date();

    const events = await CalendarEvent.find({
      endDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] },
    })
      .sort({ endDate: 1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching overdue events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue events',
      error: error.message,
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/calendar/events/upcoming
// @access  Private
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const events = await CalendarEvent.find({
      startDate: {
        $gte: now,
        $lte: futureDate,
      },
      status: { $nin: ['completed', 'cancelled'] },
    })
      .sort({ startDate: 1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message,
    });
  }
};

// @desc    Update task completion status
// @route   PUT /api/calendar/events/:id/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { completed } = req.body;

    const event = await CalendarEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Find and update the task
    const task = event.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.completed = completed;
    if (completed) {
      task.completedAt = new Date();
      task.completedBy = req.user._id;
    } else {
      task.completedAt = undefined;
      task.completedBy = undefined;
    }

    event.updatedBy = req.user._id;
    await event.save();

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};
