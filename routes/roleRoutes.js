const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  cloneRole,
  getMatrix,
  updateRolePermissions,
} = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);

router
  .route('/')
  .get(hasPermission(PERMISSIONS.VIEW_ROLES, PERMISSIONS.MANAGE_ROLES), getRoles)
  .post(hasPermission(PERMISSIONS.CREATE_ROLES, PERMISSIONS.MANAGE_ROLES), createRole);

router.get('/permissions/all', getAllPermissions);
router.get('/matrix', hasPermission(PERMISSIONS.VIEW_ROLES, PERMISSIONS.MANAGE_ROLES), getMatrix);

router
  .route('/:id')
  .get(hasPermission(PERMISSIONS.VIEW_ROLES, PERMISSIONS.MANAGE_ROLES), getRole)
  .put(hasPermission(PERMISSIONS.UPDATE_ROLES, PERMISSIONS.MANAGE_ROLES), updateRole)
  .delete(hasPermission(PERMISSIONS.DELETE_ROLES, PERMISSIONS.MANAGE_ROLES), deleteRole);

router.post('/:id/clone', hasPermission(PERMISSIONS.CREATE_ROLES, PERMISSIONS.MANAGE_ROLES), cloneRole);
router.put('/:id/permissions', hasPermission(PERMISSIONS.UPDATE_ROLES, PERMISSIONS.MANAGE_ROLES), updateRolePermissions);

module.exports = router;
