const NavigationGroup = require('../models/NavigationGroup');
const NavigationItem = require('../models/NavigationItem');

// @desc    Get public navigation (active only, for website)
// @route   GET /api/navigation
// @access  Public
exports.getPublicNavigation = async (req, res) => {
  try {
    // Get active groups, sorted by order
    const groups = await NavigationGroup.find({ isActive: true }).sort({ order: 1 });

    // Get active items for all groups
    const items = await NavigationItem.find({ isActive: true }).sort({ order: 1 });

    // Build navigation structure
    const navigation = groups.map(group => {
      const navItem = {
        title: group.title,
        type: group.type,
      };

      if (group.type === 'single') {
        navItem.path = group.path;
      } else {
        // Get items for this group
        const groupItems = items
          .filter(item => item.groupKey === group.key)
          .map(item => ({
            title: item.title,
            path: item.path,
          }));
        navItem.items = groupItems;
      }

      return navItem;
    });

    res.status(200).json({
      success: true,
      data: navigation,
    });
  } catch (error) {
    console.error('Error fetching public navigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching navigation',
    });
  }
};

// @desc    Get all navigation (for admin dashboard)
// @route   GET /api/admin/navigation
// @access  Private (Admin)
exports.getAdminNavigation = async (req, res) => {
  try {
    // Get all groups, sorted by order
    const groups = await NavigationGroup.find().sort({ order: 1 });

    // Get all items
    const items = await NavigationItem.find().sort({ order: 1 });

    // Build navigation structure with all data
    const navigation = groups.map(group => {
      const navGroup = {
        id: group._id,
        key: group.key,
        title: group.title,
        type: group.type,
        path: group.path,
        order: group.order,
        isActive: group.isActive,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };

      if (group.type === 'dropdown') {
        // Get items for this group
        const groupItems = items
          .filter(item => item.groupKey === group.key)
          .map(item => ({
            id: item._id,
            key: item.key,
            groupKey: item.groupKey,
            title: item.title,
            path: item.path,
            order: item.order,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        navGroup.items = groupItems;
      }

      return navGroup;
    });

    res.status(200).json({
      success: true,
      data: navigation,
    });
  } catch (error) {
    console.error('Error fetching admin navigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching navigation',
    });
  }
};

// @desc    Update navigation group (title, type, order, isActive)
// @route   PUT /api/admin/navigation/group/:id
// @access  Private (Admin)
exports.updateNavigationGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, order, isActive, path } = req.body;

    // Find group
    const group = await NavigationGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Navigation group not found',
      });
    }

    // Check for forbidden updates
    if (req.body.key) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update key. This field is immutable.',
      });
    }

    // Warn if changing type
    if (type && type !== group.type) {
      console.warn(`⚠️  Admin changing type of "${group.title}" from ${group.type} to ${type}`);
      
      // If changing to single, must provide path
      if (type === 'single' && !path && !group.path) {
        return res.status(400).json({
          success: false,
          message: 'Single type groups must have a path. Please provide a path.',
        });
      }
    }

    // Update allowed fields
    if (title !== undefined) group.title = title;
    if (type !== undefined) group.type = type;
    if (order !== undefined) group.order = order;
    if (isActive !== undefined) group.isActive = isActive;
    if (path !== undefined) group.path = path;

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Navigation group updated successfully',
      data: group,
    });
  } catch (error) {
    console.error('Error updating navigation group:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating navigation group',
    });
  }
};

// @desc    Update navigation item (title, groupKey, order, isActive)
// @route   PUT /api/admin/navigation/item/:id
// @access  Private (Admin)
exports.updateNavigationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, groupKey, order, isActive } = req.body;

    // Find item
    const item = await NavigationItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found',
      });
    }

    // Check for forbidden updates
    if (req.body.key || req.body.path) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update key or path. These fields are immutable.',
      });
    }

    // Warn if moving to different group
    if (groupKey && groupKey !== item.groupKey) {
      console.warn(`⚠️  Admin moving "${item.title}" from ${item.groupKey} to ${groupKey}`);
      
      // Verify target group exists
      const targetGroup = await NavigationGroup.findOne({ key: groupKey });
      if (!targetGroup) {
        return res.status(404).json({
          success: false,
          message: `Target group "${groupKey}" not found`,
        });
      }
      
      // Verify target group is dropdown type
      if (targetGroup.type !== 'dropdown') {
        return res.status(400).json({
          success: false,
          message: `Cannot move item to "${targetGroup.title}" - it's a single link, not a dropdown`,
        });
      }
    }

    // Update allowed fields
    if (title !== undefined) item.title = title;
    if (groupKey !== undefined) item.groupKey = groupKey;
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Navigation item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('Error updating navigation item:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating navigation item',
    });
  }
};

// @desc    Reorder navigation (groups or items)
// @route   PUT /api/admin/navigation/reorder
// @access  Private (Admin)
exports.reorderNavigation = async (req, res) => {
  try {
    const { type, items } = req.body;

    if (!type || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Provide type and items array.',
      });
    }

    if (type === 'groups') {
      // Reorder groups
      const updatePromises = items.map((item, index) =>
        NavigationGroup.findByIdAndUpdate(item.id, { order: index + 1 })
      );
      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'Navigation groups reordered successfully',
      });
    } else if (type === 'items') {
      // Reorder items within a group
      const updatePromises = items.map((item, index) =>
        NavigationItem.findByIdAndUpdate(item.id, { order: index + 1 })
      );
      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'Navigation items reordered successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "groups" or "items".',
      });
    }
  } catch (error) {
    console.error('Error reordering navigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering navigation',
    });
  }
};

// @desc    Attempt to create navigation (FORBIDDEN)
// @route   POST /api/admin/navigation/*
// @access  Private (Admin)
exports.forbiddenCreate = (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Creating navigation items is not allowed. Navigation structure is predefined and can only be edited.',
  });
};

// @desc    Attempt to delete navigation (FORBIDDEN)
// @route   DELETE /api/admin/navigation/*
// @access  Private (Admin)
exports.forbiddenDelete = (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Deleting navigation items is not allowed. Use isActive field to hide items instead.',
  });
};

// @desc    Create navigation group
// @route   POST /api/navigation/admin/group
// @access  Private
exports.createNavigationGroup = async (req, res) => {
  try {
    const { title, type, path } = req.body;
    if (!title || !type) return res.status(400).json({ success: false, message: 'Title and type are required' });
    if (type === 'single' && !path) return res.status(400).json({ success: false, message: 'Path is required for single type' });

    const count = await NavigationGroup.countDocuments();
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

    const group = await NavigationGroup.create({ key, title, type, path: path || '', order: count + 1, isActive: true });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete navigation group
// @route   DELETE /api/navigation/admin/group/:id
// @access  Private
exports.deleteNavigationGroup = async (req, res) => {
  try {
    const group = await NavigationGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    // Also delete all items in this group
    await NavigationItem.deleteMany({ groupKey: group.key });
    await group.deleteOne();
    res.json({ success: true, message: 'Group and its items deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create navigation item
// @route   POST /api/navigation/admin/item
// @access  Private
exports.createNavigationItem = async (req, res) => {
  try {
    const { title, path, groupKey } = req.body;
    if (!title || !path || !groupKey) return res.status(400).json({ success: false, message: 'Title, path and groupKey are required' });

    const group = await NavigationGroup.findOne({ key: groupKey });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.type !== 'dropdown') return res.status(400).json({ success: false, message: 'Can only add items to dropdown groups' });

    const count = await NavigationItem.countDocuments({ groupKey });
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

    const item = await NavigationItem.create({ key, title, path, groupKey, order: count + 1, isActive: true });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete navigation item
// @route   DELETE /api/navigation/admin/item/:id
// @access  Private
exports.deleteNavigationItem = async (req, res) => {
  try {
    const item = await NavigationItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
