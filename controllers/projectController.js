const Project = require('../models/Project');

// Helper: check if user can access a project (global perm or assigned)
const canAccessProject = (user, project) => {
  const perms = [
    ...(user.roleId?.permissions || []),
    ...(user.permissions || []),
  ];
  if (perms.includes('manage_projects')) return true;
  return project.assignedUsers.some(id => id.toString() === user._id.toString()) ||
    (project.projectManagerId && project.projectManagerId.toString() === user._id.toString());
};

// ─── ADMIN: List all projects ───────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, category, search, published, assignedTo } = req.query;
    const perms = [...(req.user.roleId?.permissions || []), ...(req.user.permissions || [])];
    const hasGlobal = perms.includes('manage_projects') || perms.includes('view_projects');

    const query = {};
    if (!hasGlobal) {
      // Scoped: only assigned projects
      query.$or = [
        { assignedUsers: req.user._id },
        { projectManagerId: req.user._id },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (published !== undefined) query.isPublishedToWebsite = published === 'true';
    if (assignedTo) query.assignedUsers = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const projects = await Project.find(query)
      .populate('assignedUsers', 'name email avatar')
      .populate('projectManagerId', 'name email avatar')
      .populate('createdBy', 'name email')
      .select('-updates -description')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);
    res.json({
      success: true,
      data: projects,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Get single project ───────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedUsers', 'name email avatar')
      .populate('projectManagerId', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('updates.createdBy', 'name email avatar');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!canAccessProject(req.user, project))
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Create project ───────────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id, updatedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Update project ───────────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!canAccessProject(req.user, project))
      return res.status(403).json({ success: false, message: 'Access denied' });

    // Prevent publishing non-completed projects
    if (req.body.isPublishedToWebsite && req.body.status !== 'completed' && project.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed projects can be published to website' });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('assignedUsers', 'name email avatar').populate('projectManagerId', 'name email avatar');

    res.json({ success: true, message: 'Project updated', data: updated });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Patch status ─────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, progressPercent } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!canAccessProject(req.user, project))
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (status) project.status = status;
    if (progressPercent !== undefined) project.progressPercent = progressPercent;
    if (project.status !== 'completed') project.isPublishedToWebsite = false;
    project.updatedBy = req.user._id;
    await project.save();

    res.json({ success: true, message: 'Status updated', data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Assign users ─────────────────────────────────────────────────────
exports.assignUsers = async (req, res) => {
  try {
    const { assignedUsers, projectManagerId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { assignedUsers, projectManagerId, updatedBy: req.user._id },
      { new: true }
    ).populate('assignedUsers', 'name email avatar').populate('projectManagerId', 'name email avatar');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Users assigned', data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Toggle publish ───────────────────────────────────────────────────
exports.togglePublish = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Only completed projects can be published' });

    project.isPublishedToWebsite = !project.isPublishedToWebsite;
    project.updatedBy = req.user._id;
    await project.save();

    res.json({ success: true, message: `Project ${project.isPublishedToWebsite ? 'published' : 'unpublished'}`, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Delete project ───────────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Add update ───────────────────────────────────────────────────────
exports.addUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!canAccessProject(req.user, project))
      return res.status(403).json({ success: false, message: 'Access denied' });

    project.updates.push({ ...req.body, createdBy: req.user._id });
    project.updatedBy = req.user._id;
    await project.save();

    const updated = await Project.findById(req.params.id).populate('updates.createdBy', 'name email avatar');
    res.status(201).json({ success: true, message: 'Update added', data: updated.updates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Get updates ──────────────────────────────────────────────────────
exports.getUpdates = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('updates.createdBy', 'name email avatar');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!canAccessProject(req.user, project))
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project.updates.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Edit update ──────────────────────────────────────────────────────
exports.editUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const update = project.updates.id(req.params.updateId);
    if (!update) return res.status(404).json({ success: false, message: 'Update not found' });

    const perms = [...(req.user.roleId?.permissions || []), ...(req.user.permissions || [])];
    const isOwner = update.createdBy.toString() === req.user._id.toString();
    if (!isOwner && !perms.includes('manage_projects'))
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (req.body.title) update.title = req.body.title;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.type) update.type = req.body.type;
    await project.save();

    res.json({ success: true, message: 'Update edited', data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Delete update ────────────────────────────────────────────────────
exports.deleteUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const update = project.updates.id(req.params.updateId);
    if (!update) return res.status(404).json({ success: false, message: 'Update not found' });

    const perms = [...(req.user.roleId?.permissions || []), ...(req.user.permissions || [])];
    const isOwner = update.createdBy.toString() === req.user._id.toString();
    if (!isOwner && !perms.includes('manage_projects'))
      return res.status(403).json({ success: false, message: 'Access denied' });

    update.deleteOne();
    await project.save();
    res.json({ success: true, message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC: List published completed projects ───────────────────────────────
exports.getPublicProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, featured } = req.query;
    const query = { status: 'completed', isPublishedToWebsite: true };
    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const projects = await Project.find(query)
      .select('title slug shortDescription category location featuredImage isFeatured tags endDate')
      .sort('-endDate -createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);
    res.json({
      success: true,
      data: projects,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC: Single published project by slug ────────────────────────────────
exports.getPublicProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, status: 'completed', isPublishedToWebsite: true })
      .select('-assignedUsers -projectManagerId -createdBy -updatedBy -documents');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Seed demo projects ───────────────────────────────────────────────
const DEMO_PROJECTS = [
  {
    title: 'Abuja Federal Secretariat Complex',
    shortDescription: 'Construction of a 12-storey federal secretariat complex with modern office facilities and underground parking.',
    description: 'A landmark government infrastructure project involving the design and construction of a 12-storey federal secretariat complex in the heart of Abuja. The project includes modern office spaces, conference halls, underground parking for 400 vehicles, and full MEP installations.',
    category: 'construction', location: 'Abuja, FCT', clientName: 'Federal Ministry of Works',
    status: 'completed', priority: 'high', progressPercent: 100,
    startDate: new Date('2021-03-01'), endDate: new Date('2023-11-30'),
    isPublishedToWebsite: true, isFeatured: true,
    tags: ['government', 'high-rise', 'federal', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  },
  {
    title: 'Lagos–Ibadan Expressway Rehabilitation',
    shortDescription: 'Full rehabilitation and expansion of the 127km Lagos–Ibadan expressway including bridges and drainage.',
    description: 'Comprehensive rehabilitation of the 127km Lagos–Ibadan expressway corridor. Works include pavement reconstruction, bridge rehabilitation, drainage improvement, road markings, and installation of solar-powered street lighting along the entire route.',
    category: 'infrastructure', location: 'Lagos / Ogun State', clientName: 'Federal Roads Maintenance Agency',
    status: 'ongoing', priority: 'high', progressPercent: 68,
    startDate: new Date('2023-01-15'), expectedCompletionDate: new Date('2025-06-30'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['road', 'expressway', 'federal', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80' },
  },
  {
    title: 'Kano Industrial Estate Phase 2',
    shortDescription: 'Development of 45 factory units and supporting infrastructure for the Kano Free Trade Zone.',
    description: 'Phase 2 development of the Kano Industrial Estate comprising 45 factory units, internal road network, water treatment plant, 33KV power substation, and perimeter fencing across 120 hectares.',
    category: 'industrial', location: 'Kano, Kano State', clientName: 'Kano State Investment Promotion Agency',
    status: 'ongoing', priority: 'high', progressPercent: 45,
    startDate: new Date('2023-06-01'), expectedCompletionDate: new Date('2025-12-31'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['industrial', 'factory', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' },
  },
  {
    title: 'Gwarinpa Estate Luxury Residences',
    shortDescription: 'Development of 80 luxury 4-bedroom detached homes with smart home technology in Gwarinpa.',
    description: 'A premium residential development of 80 luxury 4-bedroom detached homes in the Gwarinpa district of Abuja. Each unit features smart home automation, solar power backup, BQ, swimming pool, and landscaped gardens.',
    category: 'real-estate', location: 'Gwarinpa, Abuja', clientName: 'Gwarinpa Homes Ltd',
    status: 'completed', priority: 'medium', progressPercent: 100,
    startDate: new Date('2020-09-01'), endDate: new Date('2022-08-31'),
    isPublishedToWebsite: true, isFeatured: true,
    tags: ['residential', 'luxury', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
  },
  {
    title: 'Suleja Water Treatment Plant',
    shortDescription: 'Construction of a 50,000m³/day water treatment plant serving Suleja and environs.',
    description: 'Design and construction of a 50,000 cubic metres per day water treatment plant including intake works, sedimentation tanks, filtration units, chlorination facility, pumping stations, and a 10km transmission main.',
    category: 'infrastructure', location: 'Suleja, Niger State', clientName: 'Niger State Water Board',
    status: 'completed', priority: 'high', progressPercent: 100,
    startDate: new Date('2019-04-01'), endDate: new Date('2021-10-15'),
    isPublishedToWebsite: true, isFeatured: false,
    tags: ['water', 'treatment', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80' },
  },
  {
    title: 'Minna Teaching Hospital Expansion',
    shortDescription: 'Construction of a new 200-bed wing, theatre complex, and diagnostic centre.',
    description: 'Expansion of the Minna Teaching Hospital with a new 200-bed inpatient wing, 4-theatre surgical complex, modern diagnostic and imaging centre, pharmacy, and staff accommodation block.',
    category: 'construction', location: 'Minna, Niger State', clientName: 'Niger State Ministry of Health',
    status: 'on-hold', priority: 'high', progressPercent: 32,
    startDate: new Date('2022-11-01'), expectedCompletionDate: new Date('2025-05-31'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['hospital', 'healthcare', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80' },
  },
  {
    title: 'Abuja Ring Road Section 4',
    shortDescription: 'Construction of 18km dual carriageway ring road with 3 interchanges and 2 flyovers.',
    description: 'Construction of Section 4 of the Abuja Ring Road comprising 18km of dual carriageway, 3 grade-separated interchanges, 2 flyover bridges, pedestrian walkways, storm drainage, and street lighting.',
    category: 'infrastructure', location: 'Abuja, FCT', clientName: 'FCT Administration',
    status: 'planned', priority: 'medium', progressPercent: 0,
    startDate: new Date('2025-01-01'), expectedCompletionDate: new Date('2027-06-30'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['road', 'ring-road', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  },
  {
    title: 'Kaduna Steel Rolling Mill Upgrade',
    shortDescription: 'Upgrade and modernisation of the Kaduna Steel Rolling Mill to 500,000 tonnes/year capacity.',
    description: 'Comprehensive upgrade including installation of a new electric arc furnace, continuous casting machine, rolling mill line, and auxiliary systems. Increases annual production capacity from 150,000 to 500,000 tonnes.',
    category: 'industrial', location: 'Kaduna, Kaduna State', clientName: 'Delta Steel Company',
    status: 'ongoing', priority: 'high', progressPercent: 55,
    startDate: new Date('2023-03-01'), expectedCompletionDate: new Date('2025-09-30'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['steel', 'industrial', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80' },
  },
  {
    title: 'Port Harcourt Mixed-Use Tower',
    shortDescription: 'A 22-storey mixed-use tower with retail, office, and serviced apartments in Port Harcourt GRA.',
    description: 'Design and construction of a 22-storey mixed-use development comprising 4 floors of retail, 10 floors of Grade-A office space, and 8 floors of fully serviced apartments. Includes basement parking for 300 vehicles.',
    category: 'real-estate', location: 'Port Harcourt, Rivers State', clientName: 'PH Towers Development Ltd',
    status: 'ongoing', priority: 'medium', progressPercent: 22,
    startDate: new Date('2024-02-01'), expectedCompletionDate: new Date('2027-01-31'),
    isPublishedToWebsite: false, isFeatured: false,
    tags: ['high-rise', 'mixed-use', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  },
  {
    title: 'Ibadan Solar Power Substation',
    shortDescription: 'Construction of a 132/33KV substation and 5MW solar hybrid power plant for the Ibadan industrial cluster.',
    description: 'Engineering, procurement, and construction of a 132/33KV grid substation and 5MW solar hybrid power plant. Works include civil foundations, transformer installation, switchgear, control building, and 5km 33KV feeder lines.',
    category: 'industrial', location: 'Ibadan, Oyo State', clientName: 'Ibadan Electricity Distribution Company',
    status: 'completed', priority: 'high', progressPercent: 100,
    startDate: new Date('2021-07-01'), endDate: new Date('2023-04-30'),
    isPublishedToWebsite: true, isFeatured: false,
    tags: ['power', 'solar', 'demo-data'],
    featuredImage: { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80' },
  },
];

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.seedDemoProjects = async (req, res) => {
  try {
    // Delete existing demo projects
    await Project.deleteMany({ tags: 'demo-data' });

    const projects = DEMO_PROJECTS.map(p => ({
      ...p,
      slug: slugify(p.title),
      createdBy: req.user._id,
      updatedBy: req.user._id,
    }));

    const created = await Project.insertMany(projects);
    res.status(201).json({ success: true, message: `${created.length} demo projects seeded successfully`, count: created.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
