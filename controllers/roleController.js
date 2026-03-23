const Role = require('../models/Role');
const Permission = require('../models/Permission');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (requires view_roles permission)
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private
exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create role
// @route   POST /api/roles
// @access  Private (requires create_roles permission)
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role already exists
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists',
      });
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystem: false,
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (requires update_roles permission)
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Prevent updating system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify system roles',
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (requires delete_roles permission)
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system roles',
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all permissions
// @route   GET /api/roles/permissions/all
// @access  Private
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ category: 1, name: 1 });
    
    // Group by category
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
      grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clone role
// @route   POST /api/roles/:id/clone
// @access  Private (requires create_roles permission)
exports.cloneRole = async (req, res) => {
  try {
    const sourceRole = await Role.findById(req.params.id);

    if (!sourceRole) {
      return res.status(404).json({
        success: false,
        message: 'Source role not found',
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for the cloned role',
      });
    }

    const clonedRole = await Role.create({
      name,
      description: `Cloned from ${sourceRole.name}`,
      permissions: sourceRole.permissions,
      isSystem: false,
    });

    res.status(201).json({
      success: true,
      message: 'Role cloned successfully',
      data: clonedRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get role-permission matrix
// @route   GET /api/roles/matrix
// @access  Private
exports.getMatrix = async (req, res) => {
  try {
    const [roles, permissions] = await Promise.all([
      Role.find({ isActive: true }).sort({ name: 1 }),
      Permission.find().sort({ category: 1, name: 1 }),
    ]);

    res.status(200).json({
      success: true,
      data: { roles, permissions },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update role permissions
// @route   PUT /api/roles/:id/permissions
// @access  Private
exports.updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'permissions must be an array' });
    }

    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ success: false, message: 'Cannot modify system roles' });

    role.permissions = permissions;
    await role.save();

    res.status(200).json({ success: true, message: 'Permissions updated', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
