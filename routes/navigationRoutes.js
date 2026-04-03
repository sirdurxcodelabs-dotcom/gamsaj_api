const express = require('express');
const router = express.Router();
const {
  getPublicNavigation,
  getAdminNavigation,
  updateNavigationGroup,
  updateNavigationItem,
  reorderNavigation,
  createNavigationGroup,
  createNavigationItem,
} = require('../controllers/navigationController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');

// Public
router.get('/', getPublicNavigation);

// Admin — protected
router.get('/admin', protect, hasPermission('view_navigation'), getAdminNavigation);
router.put('/admin/reorder', protect, hasPermission('edit_navigation'), reorderNavigation);

// Groups — no delete (use isActive to hide)
router.post('/admin/group', protect, hasPermission('edit_navigation'), createNavigationGroup);
router.put('/admin/group/:id', protect, hasPermission('edit_navigation'), updateNavigationGroup);

// Items — no delete (use isActive to hide)
router.post('/admin/item', protect, hasPermission('edit_navigation'), createNavigationItem);
router.put('/admin/item/:id', protect, hasPermission('edit_navigation'), updateNavigationItem);

module.exports = router;
