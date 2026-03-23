const express = require('express');
const router = express.Router();
const {
  submitContact,
  subscribe,
  getConnections,
  getConnection,
  updateConnection,
  deleteConnection,
  bulkDeleteConnections,
  exportConnections,
  getConnectionReply,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');

// Public routes
router.post('/contact', submitContact);
router.post('/subscribe', subscribe);

// Protected routes (Admin only)
router.get('/', protect, hasPermission('connections.view'), getConnections);
router.get('/export', protect, hasPermission('connections.export'), exportConnections);
router.get('/:id/reply', protect, hasPermission('connections.view'), getConnectionReply);
router.get('/:id', protect, hasPermission('connections.view'), getConnection);
router.put('/:id', protect, hasPermission('connections.manage'), updateConnection);
router.delete('/:id', protect, hasPermission('connections.delete'), deleteConnection);
router.post('/bulk-delete', protect, hasPermission('connections.delete'), bulkDeleteConnections);

module.exports = router;
