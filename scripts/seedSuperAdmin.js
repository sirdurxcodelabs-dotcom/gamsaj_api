const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { PERMISSION_DEFINITIONS } = require('../config/permissions');
const { ROLE_TEMPLATES } = require('../config/roleTemplates');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Step 1: Clear and seed permissions
    await Permission.deleteMany({});
    const permissions = await Permission.insertMany(PERMISSION_DEFINITIONS);
    console.log(`✅ Seeded ${permissions.length} permissions`);

    // Step 2: Clear and seed roles
    await Role.deleteMany({});
    const roles = Object.values(ROLE_TEMPLATES).map(template => ({
      name: template.name,
      slug: template.slug,
      description: template.description,
      permissions: template.permissions,
      isSystem: template.isSystem || false,
      isActive: true,
    }));

    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ Seeded ${createdRoles.length} roles`);

    // Step 3: Find Super Admin role
    const superAdminRole = createdRoles.find(role => role.slug === 'super-admin');
    
    if (!superAdminRole) {
      throw new Error('Super Admin role not found!');
    }

    console.log(`\n🔍 Found Super Admin Role:`);
    console.log(`   ID: ${superAdminRole._id}`);
    console.log(`   Name: ${superAdminRole.name}`);
    console.log(`   Permissions: ${superAdminRole.permissions.length}`);

    // Step 4: Check if Super Admin user already exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@gamsaj.com' });
    
    if (existingSuperAdmin) {
      console.log('\n⚠️  Super Admin user already exists!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      
      // Update the role if needed using findByIdAndUpdate to avoid password hashing
      await User.findByIdAndUpdate(existingSuperAdmin._id, {
        roleId: superAdminRole._id,
        permissions: superAdminRole.permissions,
        isVerified: true,
        isActive: true,
      });
      
      console.log('✅ Updated existing Super Admin user with new role');
    } else {
      // Step 5: Create Super Admin user
      const superAdminUser = await User.create({
        name: 'Super Admin',
        email: 'superadmin@gamsaj.com',
        password: 'SuperAdmin@123',
        roleId: superAdminRole._id,
        permissions: superAdminRole.permissions,
        isVerified: true,
        isActive: true,
      });

      console.log('\n✅ Super Admin User Created Successfully!');
      console.log(`   Name: ${superAdminUser.name}`);
      console.log(`   Email: ${superAdminUser.email}`);
      console.log(`   Password: SuperAdmin@123`);
      console.log(`   Role: ${superAdminRole.name}`);
      console.log(`   Permissions: ${superAdminUser.permissions.length}`);
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Permissions: ${permissions.length}`);
    console.log(`   ✅ Roles: ${createdRoles.length}`);
    console.log(`   ✅ Super Admin User: Created/Updated`);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: superadmin@gamsaj.com');
    console.log('   Password: SuperAdmin@123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
