const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public (optionalAuth)
exports.getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      author,
      search,
      featured,
      sort = '-publishedAt',
    } = req.query;

    const query = {};

    // Status filtering: admins can pass 'all', public always gets published only
    if (req.user && status === 'all') {
      // no status filter — show all
    } else if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category) query.category = category;
    if (author) query.author = author;
    if (featured !== undefined) query.featured = featured === 'true';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-content');

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs', error: error.message });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email avatar');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await incrementViewsWithDebounce(blog, req);

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog', error: error.message });
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name email avatar');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await incrementViewsWithDebounce(blog, req);

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog', error: error.message });
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
exports.createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id,
      authorName: req.user.name,
    };

    const blog = await Blog.create(blogData);

    res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({ success: false, message: 'Failed to create blog', error: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Fields that cannot be overwritten from client
    const { author, authorName, slug: _slug, views, comments, ...safeFields } = req.body;

    // If title changed, regenerate slug
    if (safeFields.title && safeFields.title !== blog.title) {
      const newSlug = safeFields.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();

      // Ensure slug uniqueness
      const existing = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      blog.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }

    Object.assign(blog, safeFields);
    await blog.save();

    res.json({ success: true, message: 'Blog updated successfully', data: blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(400).json({ success: false, message: 'Failed to update blog', error: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await blog.deleteOne();

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blog', error: error.message });
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Public
exports.addComment = async (req, res) => {
  try {
    const { author, email, content } = req.body;

    if (!author || !email || !content) {
      return res.status(400).json({ success: false, message: 'Please provide author, email, and content' });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await blog.addComment({ author, email, content, isApproved: true });

    const updatedBlog = await Blog.findById(req.params.id);

    res.status(201).json({ success: true, message: 'Comment added successfully.', data: updatedBlog });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
};

// @desc    Add reaction to comment
// @route   POST /api/blogs/:id/comments/:commentId/reactions
// @access  Public
exports.addCommentReaction = async (req, res) => {
  try {
    const { reaction } = req.body;
    const { id: blogId, commentId } = req.params;
    const userIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const validReactions = ['like', 'heart', 'laugh', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    await blog.addCommentReaction(commentId, reaction, userIP);

    const updatedBlog = await Blog.findById(blogId);
    const comment = updatedBlog.comments.id(commentId);

    res.json({ success: true, message: 'Reaction added successfully', data: { comment, reactions: comment.reactions } });
  } catch (error) {
    console.error('Error adding comment reaction:', error);
    res.status(400).json({ success: false, message: 'Failed to add reaction', error: error.message });
  }
};

// @desc    Remove reaction from comment
// @route   DELETE /api/blogs/:id/comments/:commentId/reactions
// @access  Public
exports.removeCommentReaction = async (req, res) => {
  try {
    const { id: blogId, commentId } = req.params;
    const userIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    await blog.removeCommentReaction(commentId, userIP);

    const updatedBlog = await Blog.findById(blogId);
    const comment = updatedBlog.comments.id(commentId);

    res.json({ success: true, message: 'Reaction removed successfully', data: { comment, reactions: comment.reactions } });
  } catch (error) {
    console.error('Error removing comment reaction:', error);
    res.status(400).json({ success: false, message: 'Failed to remove reaction', error: error.message });
  }
};

// @desc    Get blog statistics
// @route   GET /api/blogs/stats/overview
// @access  Private
exports.getBlogStats = async (req, res) => {
  try {
    const [total, published, draft, archived, viewsAgg, commentsAgg] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ status: 'archived' }),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Blog.aggregate([
        { $project: { commentCount: { $size: '$comments' } } },
        { $group: { _id: null, total: { $sum: '$commentCount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        published,
        draft,
        archived,
        totalViews: viewsAgg[0]?.total || 0,
        totalComments: commentsAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog statistics', error: error.message });
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

// In-memory debounce: track IP+blogId combos for 10 minutes to prevent view inflation
const viewDebounce = new Map();
const VIEW_DEBOUNCE_MS = 10 * 60 * 1000; // 10 minutes

async function incrementViewsWithDebounce(blog, req) {
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  const key = `${ip}:${blog._id}`;
  const now = Date.now();
  const lastView = viewDebounce.get(key);

  if (!lastView || now - lastView > VIEW_DEBOUNCE_MS) {
    viewDebounce.set(key, now);
    // Use atomic update to avoid race conditions
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    blog.views += 1; // reflect in response
  }
}
