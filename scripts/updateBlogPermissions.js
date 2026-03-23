const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { PERMISSION_DEFINITIONS } = require('../config/permissions');

dotenv.config();

const updateBlogPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Blog permissions to add
    const blogPermissions = [
      'view_blogs',
      'create_blogs', 
      'update_blogs',
      'delete_blogs',
      'manage_blogs'
    ];

    // Find or create blog permissions
    for (const permSlug of blogPermissions) {
      const permDef = PERMISSION_DEFINITIONS.find(p => p.slug === permSlug);
      if (permDef) {
        await Permission.findOneAndUpdate(
          { slug: permSlug },
          {
            name: permDef.name,
            slug: permDef.slug,
            category: permDef.category,
            resource: permDef.resource,
            action: permDef.action,
            description: permDef.description,
          },
          { upsert: true, new: true }
        );
        console.log(`✓ Permission ${permSlug} created/updated`);
      }
    }

    // Update Super Admin role with blog permissions
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });
    if (superAdminRole) {
      // Add blog permissions to existing permissions
      const updatedPermissions = [...new Set([...superAdminRole.permissions, ...blogPermissions])];
      
      await Role.findByIdAndUpdate(superAdminRole._id, {
        permissions: updatedPermissions
      });
      
      console.log(`✓ Super Admin role updated with blog permissions`);
      console.log(`Total permissions: ${updatedPermissions.length}`);
    } else {
      console.log('❌ Super Admin role not found');
    }

    console.log('Blog permissions update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating blog permissions:', error);
    process.exit(1);
  }
};

updateBlogPermissions();