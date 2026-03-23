const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { hasPermission, isSuperAdmin } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

// Profile routes (must come before /:id routes)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

router
  .route('/')
  .get(hasPermission(PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS), getUsers)
  .post(hasPermission(PERMISSIONS.CREATE_USERS, PERMISSIONS.MANAGE_USERS), createUser);

router.put('/:id/toggle-active', hasPermission(PERMISSIONS.UPDATE_USERS, PERMISSIONS.MANAGE_USERS), toggleUserActive);

router
  .route('/:id')
  .get(hasPermission(PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS), getUser)
  .put(hasPermission(PERMISSIONS.UPDATE_USERS, PERMISSIONS.MANAGE_USERS), updateUser)
  .delete(hasPermission(PERMISSIONS.DELETE_USERS, PERMISSIONS.MANAGE_USERS), deleteUser);

module.exports = router;
