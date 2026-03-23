const express = require('express');
const router = express.Router();
const {
  getPublicNavigation,
  getAdminNavigation,
  updateNavigationGroup,
  updateNavigationItem,
  reorderNavigation,
  forbiddenCreate,
  forbiddenDelete,
} = require('../controllers/navigationController');
const { protect } = require('../middleware/auth');
const { hasPermission, isSuperAdmin } = require('../middleware/permission');

// Public routes (for website)
router.get('/', getPublicNavigation);

// Admin routes (protected)
router.get('/admin', protect, hasPermission('view_navigation'), getAdminNavigation);

router.put(
  '/admin/group/:id',
  protect,
  hasPermission('edit_navigation'),
  updateNavigationGroup
);

router.put(
  '/admin/item/:id',
  protect,
  hasPermission('edit_navigation'),
  updateNavigationItem
);

router.put(
  '/admin/reorder',
  protect,
  hasPermission('edit_navigation'),
  reorderNavigation
);

// Forbidden routes (return 403)
router.post('/admin/group', protect, forbiddenCreate);
router.post('/admin/item', protect, forbiddenCreate);
router.delete('/admin/group/:id', protect, forbiddenDelete);
router.delete('/admin/item/:id', protect, forbiddenDelete);

module.exports = router;
