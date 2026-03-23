const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');

dotenv.config();

const updateSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find super-admin role
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });
    
    if (!superAdminRole) {
      console.log('❌ Super Admin role not found');
      process.exit(1);
    }

    console.log(`✅ Found Super Admin role with ${superAdminRole.permissions.length} permissions`);

    // Update all users with super-admin role
    const result = await User.updateMany(
      { roleId: superAdminRole._id },
      { $set: { permissions: superAdminRole.permissions } }
    );

    console.log(`✅ Updated ${result.modifiedCount} super admin user(s)`);
    console.log('\n✅ Super Admin permissions updated successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating super admin:', error);
    process.exit(1);
  }
};

updateSuperAdmin();
