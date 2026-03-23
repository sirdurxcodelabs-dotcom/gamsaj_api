const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  addCommentReaction,
  removeCommentReaction,
  getBlogStats,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const { hasPermission } = require('../middleware/permission');

// Public routes with optional authentication
router.get('/', optionalAuth, getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlog);
router.post('/:id/comments', addComment);
router.post('/:id/comments/:commentId/reactions', addCommentReaction);
router.delete('/:id/comments/:commentId/reactions', removeCommentReaction);

// Protected routes
router.use(protect);

router.get('/stats/overview', hasPermission('view_blogs'), getBlogStats);
router.post('/', hasPermission('create_blogs'), createBlog);
router.put('/:id', hasPermission('update_blogs'), updateBlog);
router.delete('/:id', hasPermission('delete_blogs'), deleteBlog);

module.exports = router;
