const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NavigationGroup = require('../models/NavigationGroup');
const NavigationItem = require('../models/NavigationItem');
const { NAVIGATION_GROUPS, NAVIGATION_ITEMS } = require('../config/navigationData');

dotenv.config();

const seedNavigation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing navigation data
    await NavigationGroup.deleteMany({});
    await NavigationItem.deleteMany({});
    console.log('🗑️  Cleared existing navigation data');

    // Seed Navigation Groups
    const groups = await NavigationGroup.insertMany(NAVIGATION_GROUPS);
    console.log(`✅ Seeded ${groups.length} navigation groups`);

    // Seed Navigation Items
    const items = await NavigationItem.insertMany(NAVIGATION_ITEMS);
    console.log(`✅ Seeded ${items.length} navigation items`);

    console.log('\n📊 Seeding Summary:');
    console.log(`   Navigation Groups: ${groups.length}`);
    console.log(`   Navigation Items: ${items.length}`);
    
    console.log('\n📋 Navigation Structure:');
    for (const group of groups) {
      const groupItems = items.filter(item => item.groupKey === group.key);
      console.log(`   ${group.title} (${group.type})`);
      if (group.type === 'single') {
        console.log(`      → ${group.path}`);
      } else {
        groupItems.forEach(item => {
          console.log(`      → ${item.title}: ${item.path}`);
        });
      }
    }

    console.log('\n✅ Navigation seeding completed successfully!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Navigation routes (paths) are IMMUTABLE');
    console.log('   - Only titles, order, and visibility can be edited');
    console.log('   - No creation or deletion allowed via admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding navigation:', error);
    process.exit(1);
  }
};

seedNavigation();
