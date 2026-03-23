const mongoose = require('mongoose');
require('dotenv').config();

const Email = require('../models/Email');
const Connection = require('../models/Connection');
const User = require('../models/User');
const Role = require('../models/Role');

const createMissingEmails = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admin roles
    const adminRoles = await Role.find({
      slug: { $in: ['super-admin', 'administration-manager', 'managing-director'] },
    });

    // Find users with these roles
    const adminUsers = await User.find({
      roleId: { $in: adminRoles.map((r) => r._id) },
      isActive: true,
    });

    console.log(`\n👥 Found ${adminUsers.length} admin users`);

    // Find connections without emails
    const existingEmailConnectionIds = await Email.distinct('contactId');
    const connectionsWithoutEmails = await Connection.find({
      _id: { $nin: existingEmailConnectionIds },
    });

    console.log(`\n📞 Found ${connectionsWithoutEmails.length} connections without emails`);

    if (connectionsWithoutEmails.length === 0) {
      console.log('\n✅ All connections already have emails!');
      process.exit(0);
    }

    let createdCount = 0;

    // Create emails for each connection
    for (const connection of connectionsWithoutEmails) {
      console.log(`\n📧 Creating emails for ${connection.type}: ${connection.email}`);

      for (const admin of adminUsers) {
        try {
          if (connection.type === 'contact') {
            await Email.create({
              from: {
                name: connection.fullName,
                email: connection.email,
              },
              to: {
                name: admin.name,
                email: process.env.SMTP_USER || 'admin@gamsaj.com',
              },
              subject: `[Contact Form] ${connection.subject}`,
              body: `From: ${connection.fullName} (${connection.email})\nPhone: ${connection.phone}\nCompany: ${connection.company || 'N/A'}\nReason: ${connection.reasonForContact}\n\n${connection.message}`,
              htmlBody: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h3 style="color: #007bff;">New Contact Form Submission</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>From:</strong> ${connection.fullName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${connection.email}">${connection.email}</a></p>
                    <p><strong>Phone:</strong> ${connection.phone}</p>
                    <p><strong>Company:</strong> ${connection.company || 'N/A'}</p>
                    <p><strong>Reason:</strong> ${connection.reasonForContact}</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-left: 3px solid #007bff; margin: 15px 0;">
                    <p style="white-space: pre-wrap;">${connection.message}</p>
                  </div>
                </div>
              `,
              type: 'inbox',
              userId: admin._id,
              contactId: connection._id,
              isRead: connection.status === 'read' || connection.status === 'responded',
              createdAt: connection.createdAt,
              updatedAt: connection.updatedAt,
            });
          } else if (connection.type === 'subscriber') {
            await Email.create({
              from: {
                name: connection.email.split('@')[0],
                email: connection.email,
              },
              to: {
                name: admin.name,
                email: process.env.SMTP_USER || 'admin@gamsaj.com',
              },
              subject: '[Newsletter] New Subscription',
              body: `New newsletter subscription from: ${connection.email}`,
              htmlBody: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h3 style="color: #28a745;">New Newsletter Subscription</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Email:</strong> <a href="mailto:${connection.email}">${connection.email}</a></p>
                    <p><strong>Subscribed:</strong> ${connection.createdAt.toLocaleString()}</p>
                  </div>
                </div>
              `,
              type: 'inbox',
              userId: admin._id,
              contactId: connection._id,
              isRead: false,
              createdAt: connection.createdAt,
              updatedAt: connection.updatedAt,
            });
          }

          createdCount++;
          console.log(`   ✅ Created email for ${admin.name}`);
        } catch (error) {
          console.error(`   ❌ Error creating email for ${admin.name}:`, error.message);
        }
      }
    }

    console.log(`\n\n✅ Successfully created ${createdCount} emails!`);
    console.log(`📊 ${connectionsWithoutEmails.length} connections × ${adminUsers.length} admins = ${connectionsWithoutEmails.length * adminUsers.length} expected emails`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createMissingEmails();
