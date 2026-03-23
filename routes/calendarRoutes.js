const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateStatus,
  snoozeEvent,
  getTodayEvents,
  getOverdueEvents,
  getUpcomingEvents,
  updateTaskStatus,
} = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');

// All routes require authentication
router.use(protect);

// Special routes (must come before /:id routes)
router.get('/events/today', getTodayEvents);
router.get('/events/overdue', getOverdueEvents);
router.get('/events/upcoming', getUpcomingEvents);

// Main CRUD routes
router
  .route('/events')
  .get(getEvents)
  .post(hasPermission('calendar.create', 'manage_calendar'), createEvent);

router
  .route('/events/:id')
  .get(getEvent)
  .put(hasPermission('calendar.update', 'manage_calendar'), updateEvent)
  .delete(hasPermission('calendar.delete', 'manage_calendar'), deleteEvent);

// Status and snooze routes
router.put('/events/:id/status', hasPermission('calendar.update', 'manage_calendar'), updateStatus);
router.post('/events/:id/snooze', hasPermission('calendar.update', 'manage_calendar'), snoozeEvent);

// Task routes
router.put('/events/:id/tasks/:taskId', hasPermission('calendar.update', 'manage_calendar'), updateTaskStatus);

module.exports = router;
