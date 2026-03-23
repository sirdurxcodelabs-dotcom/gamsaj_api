const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  markSoundPlayed,
  createNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Special routes (must come before /:id routes)
router.get('/unread/count', getUnreadCount);
router.get('/recent', getRecentNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/read', deleteAllRead);

// Main routes
router.route('/').get(getNotifications).post(createNotification);

router.route('/:id').delete(deleteNotification);

router.put('/:id/read', markAsRead);
router.put('/:id/sound-played', markSoundPlayed);

module.exports = router;
