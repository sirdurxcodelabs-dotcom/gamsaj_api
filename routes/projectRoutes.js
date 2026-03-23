const express = require('express');
const router = express.Router();
const {
  getProjects, getProject, createProject, updateProject,
  updateStatus, assignUsers, togglePublish, deleteProject,
  addUpdate, getUpdates, editUpdate, deleteUpdate,
  getPublicProjects, getPublicProjectBySlug, seedDemoProjects,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permission');

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/public', getPublicProjects);
router.get('/public/:slug', getPublicProjectBySlug);

// ── Protected routes ───────────────────────────────────────────────────────
router.use(protect);

router.get('/', hasPermission('view_projects', 'manage_projects'), getProjects);
router.post('/', hasPermission('create_projects', 'manage_projects'), createProject);

router.get('/:id', hasPermission('view_projects', 'manage_projects'), getProject);
router.put('/:id', hasPermission('update_projects', 'manage_projects'), updateProject);
router.delete('/:id', hasPermission('delete_projects', 'manage_projects'), deleteProject);

router.patch('/:id/status', hasPermission('update_projects', 'manage_projects'), updateStatus);
router.patch('/:id/assign-users', hasPermission('manage_projects'), assignUsers);
router.patch('/:id/publish', hasPermission('manage_projects', 'update_projects'), togglePublish);

router.post('/seed-demo', hasPermission('manage_projects'), seedDemoProjects);

router.get('/:id/updates', hasPermission('view_projects', 'manage_projects'), getUpdates);
router.post('/:id/updates', hasPermission('update_projects', 'manage_projects'), addUpdate);
router.put('/:id/updates/:updateId', hasPermission('update_projects', 'manage_projects'), editUpdate);
router.delete('/:id/updates/:updateId', hasPermission('update_projects', 'manage_projects'), deleteUpdate);

module.exports = router;
