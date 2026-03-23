const express = require('express');
const router = express.Router();
const {
  getEmails,
  getEmail,
  sendEmailMessage,
  saveDraft,
  toggleReadStatus,
  toggleStar,
  moveEmail,
  deleteEmail,
  bulkOperation,
  getConnectionReply,
} = require('../controllers/emailController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');

// All routes require authentication and email permission
router.use(protect);
router.use(hasPermission('view_email'));

// Email routes
router.get('/', getEmails);
router.get('/connection/:connectionId/reply', getConnectionReply);
router.get('/:id', getEmail);
router.post('/send', hasPermission('manage_email'), sendEmailMessage);
router.post('/draft', saveDraft);
router.put('/:id/read', toggleReadStatus);
router.put('/:id/star', toggleStar);
router.put('/:id/move', moveEmail);
router.delete('/:id', deleteEmail);
router.post('/bulk', bulkOperation);

module.exports = router;
