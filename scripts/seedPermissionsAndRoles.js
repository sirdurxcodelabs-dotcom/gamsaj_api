const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { PERMISSION_DEFINITIONS } = require('../config/permissions');
const { ROLE_TEMPLATES } = require('../config/roleTemplates');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Permission.deleteMany({});
    await Role.deleteMany({});
    console.log('🗑️  Cleared existing permissions and roles');

    // Seed Permissions
    const permissions = await Permission.insertMany(PERMISSION_DEFINITIONS);
    console.log(`✅ Seeded ${permissions.length} permissions`);

    // Seed Roles
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

    console.log('\n📊 Seeding Summary:');
    console.log(`   Permissions: ${permissions.length}`);
    console.log(`   Roles: ${createdRoles.length}`);
    console.log('\n✅ Database seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
