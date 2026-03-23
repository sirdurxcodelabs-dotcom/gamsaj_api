const mongoose = require('mongoose');
require('dotenv').config();

const Email = require('../models/Email');
const Connection = require('../models/Connection');
const User = require('../models/User');

const testEmailCreation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check for existing emails
    const emailCount = await Email.countDocuments();
    console.log(`\n📧 Total emails in database: ${emailCount}`);

    // Check emails by type
    const inboxCount = await Email.countDocuments({ type: 'inbox' });
    const sentCount = await Email.countDocuments({ type: 'sent' });
    const draftCount = await Email.countDocuments({ type: 'draft' });
    const spamCount = await Email.countDocuments({ type: 'spam' });

    console.log(`\n📊 Emails by folder:`);
    console.log(`   Inbox: ${inboxCount}`);
    console.log(`   Sent: ${sentCount}`);
    console.log(`   Drafts: ${draftCount}`);
    console.log(`   Spam: ${spamCount}`);

    // Check unread emails
    const unreadCount = await Email.countDocuments({ isRead: false, type: 'inbox' });
    console.log(`\n📬 Unread inbox emails: ${unreadCount}`);

    // Check emails with contactId
    const contactEmails = await Email.countDocuments({ contactId: { $ne: null } });
    console.log(`\n🔗 Emails linked to connections: ${contactEmails}`);

    // Get sample emails
    const sampleEmails = await Email.find({ type: 'inbox' })
      .populate('contactId', 'type')
      .limit(5)
      .sort({ createdAt: -1 });

    console.log(`\n📋 Sample inbox emails:`);
    sampleEmails.forEach((email, index) => {
      console.log(`\n   ${index + 1}. ${email.subject}`);
      console.log(`      From: ${email.from.name} <${email.from.email}>`);
      console.log(`      To: ${email.to.name} <${email.to.email}>`);
      console.log(`      Read: ${email.isRead ? 'Yes' : 'No'}`);
      console.log(`      Connection Type: ${email.contactId ? email.contactId.type : 'None'}`);
      console.log(`      Created: ${email.createdAt}`);
    });

    // Check connections
    const connectionCount = await Connection.countDocuments();
    const contactCount = await Connection.countDocuments({ type: 'contact' });
    const subscriberCount = await Connection.countDocuments({ type: 'subscriber' });

    console.log(`\n\n📞 Connections:`);
    console.log(`   Total: ${connectionCount}`);
    console.log(`   Contacts: ${contactCount}`);
    console.log(`   Subscribers: ${subscriberCount}`);

    // Check users
    const userCount = await User.countDocuments();
    const adminUsers = await User.find({ isActive: true }).select('name email roleId');
    
    console.log(`\n\n👥 Users:`);
    console.log(`   Total: ${userCount}`);
    console.log(`   Active admins: ${adminUsers.length}`);
    adminUsers.forEach((user) => {
      console.log(`      - ${user.name} <${user.email}>`);
    });

    // Check for orphaned connections (connections without emails)
    const connectionsWithoutEmails = await Connection.find({
      _id: { $nin: await Email.distinct('contactId') },
    });

    if (connectionsWithoutEmails.length > 0) {
      console.log(`\n\n⚠️  Found ${connectionsWithoutEmails.length} connections without emails:`);
      connectionsWithoutEmails.forEach((conn, index) => {
        console.log(`   ${index + 1}. ${conn.type} - ${conn.email} (${conn.createdAt})`);
      });
    } else {
      console.log(`\n\n✅ All connections have corresponding emails`);
    }

    console.log('\n✅ Test complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testEmailCreation();
