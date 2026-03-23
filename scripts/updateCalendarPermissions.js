const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { PERMISSION_DEFINITIONS } = require('../config/permissions');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateCalendarPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get calendar permissions from definitions
    const calendarPermissions = PERMISSION_DEFINITIONS.filter(
      (p) => p.resource === 'calendar' && p.slug.startsWith('calendar.')
    );

    console.log('\n📅 Creating Calendar Permissions...');
    const createdPermissions = [];

    for (const permDef of calendarPermissions) {
      try {
        // Use findOneAndUpdate with upsert to avoid pre-save hook issues
        const permission = await Permission.findOneAndUpdate(
          { slug: permDef.slug },
          permDef,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`✓ Upserted permission: ${permDef.name}`);
        createdPermissions.push(permission);
      } catch (error) {
        console.log(`⚠️  Error with permission ${permDef.name}:`, error.message);
      }
    }

    // Update Super Admin role
    console.log('\n👑 Updating Super Admin Role...');
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });

    if (superAdminRole) {
      // Get all permission SLUGS (not IDs)
      const allPermissions = await Permission.find({});
      const allPermissionSlugs = allPermissions.map((p) => p.slug);

      // Update with permission slugs (strings)
      await Role.updateOne(
        { _id: superAdminRole._id },
        { $set: { permissions: allPermissionSlugs } }
      );

      console.log(`✓ Super Admin role updated with ${allPermissionSlugs.length} permissions`);
      console.log('✓ Calendar permissions added to Super Admin');
    } else {
      console.log('⚠️  Super Admin role not found');
    }

    console.log('\n✅ Calendar permissions setup complete!');
    console.log('\nCalendar Permissions Created:');
    createdPermissions.forEach((p) => {
      console.log(`  - ${p.name} (${p.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateCalendarPermissions();
