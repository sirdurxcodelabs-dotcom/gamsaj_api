const mongoose = require('mongoose');
require('dotenv').config();

const Email = require('../models/Email');
const Connection = require('../models/Connection');

const checkConnectionEmails = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const connectionId = process.argv[2];

    if (!connectionId) {
      console.log('Usage: node checkConnectionEmails.js <connectionId>');
      console.log('\nExample: node checkConnectionEmails.js 6970990fec62f195dc8cb1e6\n');
      
      // Show some recent connections
      const recentConnections = await Connection.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id type email fullName status createdAt');
      
      console.log('📞 Recent Connections:');
      recentConnections.forEach((conn, index) => {
        console.log(`\n${index + 1}. ID: ${conn._id}`);
        console.log(`   Type: ${conn.type}`);
        console.log(`   Email: ${conn.email}`);
        if (conn.fullName) console.log(`   Name: ${conn.fullName}`);
        console.log(`   Status: ${conn.status}`);
        console.log(`   Created: ${conn.createdAt}`);
      });
      
      process.exit(0);
    }

    // Check if connection exists
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
      console.log(`❌ Connection not found: ${connectionId}\n`);
      process.exit(1);
    }

    console.log('📞 Connection Details:');
    console.log(`   ID: ${connection._id}`);
    console.log(`   Type: ${connection.type}`);
    console.log(`   Email: ${connection.email}`);
    if (connection.fullName) console.log(`   Name: ${connection.fullName}`);
    console.log(`   Status: ${connection.status}`);
    console.log(`   Created: ${connection.createdAt}`);
    if (connection.respondedAt) console.log(`   Responded: ${connection.respondedAt}`);

    // Check for inbox emails
    console.log('\n📧 Inbox Emails for this Connection:');
    const inboxEmails = await Email.find({
      contactId: connectionId,
      type: 'inbox',
      isDeleted: false,
    }).select('_id subject from to createdAt isRead');

    if (inboxEmails.length === 0) {
      console.log('   ❌ No inbox emails found');
    } else {
      inboxEmails.forEach((email, index) => {
        console.log(`\n   ${index + 1}. ${email.subject}`);
        console.log(`      From: ${email.from.name || email.from.email}`);
        console.log(`      To: ${email.to.email}`);
        console.log(`      Read: ${email.isRead ? 'Yes' : 'No'}`);
        console.log(`      Created: ${email.createdAt}`);
      });
    }

    // Check for sent emails (replies)
    console.log('\n📤 Sent Emails (Replies) for this Connection:');
    const sentEmails = await Email.find({
      contactId: connectionId,
      type: 'sent',
      isDeleted: false,
    })
      .select('_id subject from to body sentAt createdAt')
      .populate('userId', 'name email');

    if (sentEmails.length === 0) {
      console.log('   ❌ No sent emails (replies) found');
      console.log('\n   💡 This is why you\'re getting a 404 error!');
      console.log('   To fix: Send a reply via the email system or compose page.');
    } else {
      sentEmails.forEach((email, index) => {
        console.log(`\n   ${index + 1}. ${email.subject}`);
        console.log(`      From: ${email.from.name || email.from.email}`);
        console.log(`      To: ${email.to.email}`);
        console.log(`      Sent: ${email.sentAt || email.createdAt}`);
        console.log(`      Body Preview: ${email.body.substring(0, 100)}...`);
      });
    }

    // Check all emails linked to this connection
    console.log('\n📊 Summary:');
    const totalEmails = await Email.countDocuments({ contactId: connectionId });
    const inboxCount = await Email.countDocuments({ contactId: connectionId, type: 'inbox' });
    const sentCount = await Email.countDocuments({ contactId: connectionId, type: 'sent' });
    
    console.log(`   Total Emails: ${totalEmails}`);
    console.log(`   Inbox: ${inboxCount}`);
    console.log(`   Sent: ${sentCount}`);

    if (sentCount === 0 && connection.status === 'responded') {
      console.log('\n⚠️  WARNING: Connection status is "responded" but no sent emails found!');
      console.log('   This means the status was changed manually or the reply email is missing.');
    }

    console.log('\n✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkConnectionEmails();
