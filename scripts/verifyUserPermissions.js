const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Role = require('../models/Role');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyUserPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Find Super Admin user
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });
    
    if (!superAdminRole) {
      console.log('❌ Super Admin role not found');
      process.exit(1);
    }

    console.log('\n👑 Super Admin Role:');
    console.log(`Name: ${superAdminRole.name}`);
    console.log(`Slug: ${superAdminRole.slug}`);
    console.log(`Total Permissions: ${superAdminRole.permissions.length}`);
    console.log('\nPermissions:');
    superAdminRole.permissions.forEach((perm, index) => {
      console.log(`  ${index + 1}. ${perm}`);
    });

    // Find users with Super Admin role
    const superAdminUsers = await User.find({ roleId: superAdminRole._id });
    
    console.log(`\n\n👥 Users with Super Admin Role: ${superAdminUsers.length}`);
    superAdminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${superAdminRole.name}`);
      console.log(`   Permissions: ${superAdminRole.permissions.length}`);
    });

    // Check for calendar permissions
    const calendarPermissions = superAdminRole.permissions.filter(p => p.startsWith('calendar.'));
    console.log(`\n\n📅 Calendar Permissions: ${calendarPermissions.length}`);
    calendarPermissions.forEach((perm) => {
      console.log(`  ✓ ${perm}`);
    });

    if (calendarPermissions.length === 0) {
      console.log('\n⚠️  WARNING: No calendar permissions found!');
      console.log('Run: node backend/scripts/updateCalendarPermissions.js');
    } else {
      console.log('\n✅ Calendar permissions are properly configured!');
      console.log('\n💡 If you still get permission errors:');
      console.log('   1. Log out from the admin dashboard');
      console.log('   2. Log back in');
      console.log('   3. Try creating a calendar event again');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyUserPermissions();
