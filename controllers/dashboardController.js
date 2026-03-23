const Project = require('../models/Project');
const User = require('../models/User');

// Roles that have global project visibility
const GLOBAL_ROLES = ['super-admin', 'chairman', 'managing-director', 'technical-director'];
// Roles that see org-wide summaries
const EXECUTIVE_ROLES = ['super-admin', 'chairman', 'managing-director', 'technical-director'];
const MANAGEMENT_ROLES = ['business-development-manager', 'head-of-finance', 'administration-manager'];

const getUserPerms = (user) => [
  ...(user.roleId?.permissions || []),
  ...(user.permissions || []),
];

const hasGlobalAccess = (user) => {
  const perms = getUserPerms(user);
  const slug = user.roleId?.slug || '';
  return perms.includes('manage_projects') || GLOBAL_ROLES.includes(slug);
};

// Build project query based on user access
const buildProjectQuery = (user, extraFilter = {}) => {
  const query = { ...extraFilter };
  if (!hasGlobalAccess(user)) {
    query.$or = [
      { assignedUsers: user._id },
      { projectManagerId: user._id },
    ];
  }
  return query;
};

// ─── GET /api/dashboard ──────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const roleSlug = user.roleId?.slug || '';
    const perms = getUserPerms(user);
    const global = hasGlobalAccess(user);

    const baseQuery = buildProjectQuery(user);

    // Project counts by status
    const [total, ongoing, planned, completed, onHold, cancelled] = await Promise.all([
      Project.countDocuments(baseQuery),
      Project.countDocuments({ ...baseQuery, status: 'ongoing' }),
      Project.countDocuments({ ...baseQuery, status: 'planned' }),
      Project.countDocuments({ ...baseQuery, status: 'completed' }),
      Project.countDocuments({ ...baseQuery, status: 'on-hold' }),
      Project.countDocuments({ ...baseQuery, status: 'cancelled' }),
    ]);

    // Recent updates across accessible projects
    const recentProjects = await Project.find(baseQuery)
      .select('title slug status progressPercent updates assignedUsers featuredImage location category')
      .populate('updates.createdBy', 'name avatar')
      .sort('-updatedAt')
      .limit(20);

    // Flatten and sort updates
    const recentUpdates = recentProjects
      .flatMap(p => (p.updates || []).map(u => ({
        _id: u._id,
        projectId: p._id,
        projectTitle: p.title,
        projectSlug: p.slug,
        title: u.title,
        description: u.description,
        type: u.type,
        images: u.images || [],
        createdBy: u.createdBy,
        createdAt: u.createdAt,
      })))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // My contributions (updates I posted)
    const myContributions = recentProjects
      .flatMap(p => (p.updates || [])
        .filter(u => u.createdBy && u.createdBy._id?.toString() === user._id.toString())
        .map(u => ({
          _id: u._id,
          projectId: p._id,
          projectTitle: p.title,
          title: u.title,
          type: u.type,
          createdAt: u.createdAt,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Project performance list
    const now = new Date();
    const projectPerformance = recentProjects.slice(0, 10).map(p => {
      const lastUpdate = p.updates?.length
        ? new Date(Math.max(...p.updates.map(u => new Date(u.createdAt))))
        : null;
      const daysSinceUpdate = lastUpdate
        ? Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24))
        : null;

      let health = 'healthy';
      if (p.status === 'on-hold' || p.status === 'cancelled') health = 'at-risk';
      else if (daysSinceUpdate === null || daysSinceUpdate > 14) health = 'no-update';
      else if (p.progressPercent < 20 && p.status === 'ongoing') health = 'at-risk';

      return {
        _id: p._id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        category: p.category,
        location: p.location,
        progressPercent: p.progressPercent,
        teamCount: p.assignedUsers?.length || 0,
        updatesCount: p.updates?.length || 0,
        lastUpdateDate: lastUpdate,
        daysSinceUpdate,
        health,
        featuredImage: p.featuredImage,
      };
    });

    // Org-wide user count (for executives/admins)
    let orgStats = null;
    if (global) {
      const totalUsers = await User.countDocuments({ isActive: true });
      const publishedProjects = await Project.countDocuments({ status: 'completed', isPublishedToWebsite: true });
      orgStats = { totalUsers, publishedProjects };
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          roleSlug,
          roleName: user.roleId?.name,
          permissions: perms,
          hasGlobalAccess: global,
        },
        projectCounts: { total, ongoing, planned, completed, onHold, cancelled },
        recentUpdates,
        myContributions,
        projectPerformance,
        orgStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
