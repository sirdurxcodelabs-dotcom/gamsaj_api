const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateNotificationUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Find all notifications with old URL format
    const notifications = await Notification.find({
      actionUrl: { $regex: '^/calendar/event/' }
    });

    console.log(`\n📝 Found ${notifications.length} notifications with old URL format`);

    if (notifications.length === 0) {
      console.log('✅ No notifications to update');
      process.exit(0);
    }

    // Update each notification
    let updated = 0;
    for (const notification of notifications) {
      const oldUrl = notification.actionUrl;
      // Extract event ID from old URL: /calendar/event/123 -> 123
      const eventId = oldUrl.replace('/calendar/event/', '');
      // Create new URL: /apps/calendar?eventId=123
      const newUrl = `/apps/calendar?eventId=${eventId}`;
      
      notification.actionUrl = newUrl;
      await notification.save();
      
      updated++;
      console.log(`✅ Updated: ${oldUrl} → ${newUrl}`);
    }

    console.log(`\n🎉 Successfully updated ${updated} notifications!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateNotificationUrls();
