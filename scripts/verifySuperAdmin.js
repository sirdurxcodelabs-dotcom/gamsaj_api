const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');

dotenv.config();

const verifySuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Find Super Admin user
    const superAdmin = await User.findOne({ email: 'superadmin@gamsaj.com' })
      .populate('roleId')
      .select('+password');

    if (!superAdmin) {
      console.log('❌ Super Admin user not found!');
      console.log('   Run: npm run seed:superadmin');
      process.exit(1);
    }

    console.log('✅ Super Admin User Found!\n');
    console.log('📋 User Details:');
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Verified: ${superAdmin.isVerified ? '✅' : '❌'}`);
    console.log(`   Active: ${superAdmin.isActive ? '✅' : '❌'}`);
    console.log(`   Created: ${superAdmin.createdAt}`);
    console.log(`   Updated: ${superAdmin.updatedAt}`);

    console.log('\n🎭 Role Details:');
    if (superAdmin.roleId) {
      console.log(`   Role Name: ${superAdmin.roleId.name}`);
      console.log(`   Role Slug: ${superAdmin.roleId.slug}`);
      console.log(`   System Role: ${superAdmin.roleId.isSystem ? '✅' : '❌'}`);
      console.log(`   Role Active: ${superAdmin.roleId.isActive ? '✅' : '❌'}`);
      console.log(`   Role Permissions: ${superAdmin.roleId.permissions.length}`);
    } else {
      console.log('   ❌ No role assigned!');
    }

    console.log('\n🔑 User Permissions:');
    console.log(`   Total: ${superAdmin.permissions.length}`);
    if (superAdmin.permissions.length > 0) {
      console.log(`   First 5: ${superAdmin.permissions.slice(0, 5).join(', ')}`);
    }

    console.log('\n🔐 Login Credentials:');
    console.log('   Email: superadmin@gamsaj.com');
    console.log('   Password: SuperAdmin@123');

    console.log('\n✅ Verification Complete!');
    console.log('   You can now login to the admin dashboard.');

    // Count all roles
    const roleCount = await Role.countDocuments();
    console.log(`\n📊 Database Stats:`);
    console.log(`   Total Roles: ${roleCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying Super Admin:', error);
    process.exit(1);
  }
};

verifySuperAdmin();
