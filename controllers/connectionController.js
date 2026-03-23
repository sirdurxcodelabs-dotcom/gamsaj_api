const Connection = require('../models/Connection');
const Email = require('../models/Email');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Submit contact form (public)
// @route   POST /api/connections/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const { fullName, email, phone, company, subject, message, reasonForContact } = req.body;

    // Validation
    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create connection
    const connection = await Connection.create({
      type: 'contact',
      fullName,
      email,
      phone,
      company,
      subject,
      message,
      reasonForContact,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Create email in inbox for admins with email permission
    try {
      // Find all admin roles
      const adminRoles = await Role.find({
        slug: { $in: ['super-admin', 'administration-manager', 'managing-director'] },
      });

      // Find users with these roles
      const adminUsers = await User.find({
        roleId: { $in: adminRoles.map((r) => r._id) },
        isActive: true,
      });

      // Create inbox email for each admin
      const emailPromises = adminUsers.map((admin) =>
        Email.create({
          from: {
            name: fullName,
            email: email,
          },
          to: {
            name: admin.name,
            email: process.env.SMTP_USER || 'admin@gamsaj.com',
          },
          subject: `[Contact Form] ${subject}`,
          body: `From: ${fullName} (${email})\nPhone: ${phone}\nCompany: ${company || 'N/A'}\nReason: ${reasonForContact}\n\n${message}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h3 style="color: #007bff;">New Contact Form Submission</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>From:</strong> ${fullName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Reason:</strong> ${reasonForContact}</p>
              </div>
              <div style="background: #ffffff; padding: 15px; border-left: 3px solid #007bff; margin: 15px 0;">
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          `,
          type: 'inbox',
          userId: admin._id,
          contactId: connection._id,
          isRead: false,
        })
      );

      await Promise.all(emailPromises);
    } catch (emailError) {
      console.error('Error creating inbox emails:', emailError);
      // Don't fail the request if email creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: connection,
    });
  } catch (error) {
    console.error('Error submitting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message,
    });
  }
};

// @desc    Subscribe to newsletter (public)
// @route   POST /api/connections/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Connection.findOne({
      type: 'subscriber',
      email: email.toLowerCase(),
    });

    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
      });
    }

    // Create subscriber
    const subscriber = await Connection.create({
      type: 'subscriber',
      email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Create email in inbox for admins with email permission
    try {
      // Find all admin roles
      const adminRoles = await Role.find({
        slug: { $in: ['super-admin', 'administration-manager', 'managing-director'] },
      });

      // Find users with these roles
      const adminUsers = await User.find({
        roleId: { $in: adminRoles.map((r) => r._id) },
        isActive: true,
      });

      // Create inbox email for each admin
      const emailPromises = adminUsers.map((admin) =>
        Email.create({
          from: {
            name: email.split('@')[0],
            email: email,
          },
          to: {
            name: admin.name,
            email: process.env.SMTP_USER || 'admin@gamsaj.com',
          },
          subject: '[Newsletter] New Subscription',
          body: `New newsletter subscription from: ${email}`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h3 style="color: #28a745;">New Newsletter Subscription</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
          type: 'inbox',
          userId: admin._id,
          contactId: subscriber._id,
          isRead: false,
        })
      );

      await Promise.all(emailPromises);
    } catch (emailError) {
      console.error('Error creating inbox emails for newsletter:', emailError);
      // Don't fail the request if email creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      data: subscriber,
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
      error: error.message,
    });
  }
};

// @desc    Get all connections (contacts and subscribers)
// @route   GET /api/connections
// @access  Private (Admin)
exports.getConnections = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20, search } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const connections = await Connection.find(query)
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Connection.countDocuments(query);

    // Get statistics
    const stats = {
      totalContacts: await Connection.countDocuments({ type: 'contact' }),
      totalSubscribers: await Connection.countDocuments({ type: 'subscriber' }),
      newContacts: await Connection.countDocuments({ type: 'contact', status: 'new' }),
      readContacts: await Connection.countDocuments({ type: 'contact', status: 'read' }),
      respondedContacts: await Connection.countDocuments({ type: 'contact', status: 'responded' }),
    };

    res.json({
      success: true,
      data: connections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections',
      error: error.message,
    });
  }
};

// @desc    Get single connection
// @route   GET /api/connections/:id
// @access  Private (Admin)
exports.getConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id).populate('respondedBy', 'name email');

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    // Mark as read if it's a new contact
    if (connection.type === 'contact' && connection.status === 'new') {
      connection.status = 'read';
      await connection.save();
    }

    res.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error('Error fetching connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connection',
      error: error.message,
    });
  }
};

// @desc    Update connection status
// @route   PUT /api/connections/:id
// @access  Private (Admin)
exports.updateConnection = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    if (status) connection.status = status;
    if (adminNotes !== undefined) connection.adminNotes = adminNotes;

    if (status === 'responded') {
      connection.respondedBy = req.user._id;
      connection.respondedAt = Date.now();
    }

    await connection.save();

    res.json({
      success: true,
      message: 'Connection updated successfully',
      data: connection,
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update connection',
      error: error.message,
    });
  }
};

// @desc    Delete connection
// @route   DELETE /api/connections/:id
// @access  Private (Admin)
exports.deleteConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    await connection.deleteOne();

    res.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete connection',
      error: error.message,
    });
  }
};

// @desc    Bulk delete connections
// @route   POST /api/connections/bulk-delete
// @access  Private (Admin)
exports.bulkDeleteConnections = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of connection IDs',
      });
    }

    const result = await Connection.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} connection(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete connections',
      error: error.message,
    });
  }
};

// @desc    Export connections to CSV
// @route   GET /api/connections/export
// @access  Private (Admin)
exports.exportConnections = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};

    const connections = await Connection.find(query).sort({ createdAt: -1 });

    // Create CSV content
    let csv = '';
    if (type === 'subscriber') {
      csv = 'Email,Subscribed Date,Status\n';
      connections.forEach((conn) => {
        csv += `${conn.email},${conn.createdAt.toISOString()},${conn.status}\n`;
      });
    } else {
      csv = 'Full Name,Email,Phone,Company,Subject,Reason,Message,Status,Created Date\n';
      connections.forEach((conn) => {
        if (conn.type === 'contact') {
          csv += `"${conn.fullName}","${conn.email}","${conn.phone || ''}","${conn.company || ''}","${conn.subject}","${conn.reasonForContact || ''}","${conn.message.replace(/"/g, '""')}","${conn.status}","${conn.createdAt.toISOString()}"\n`;
        }
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=connections-${type || 'all'}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export connections',
      error: error.message,
    });
  }
};

// @desc    Get reply for a connection
// @route   GET /api/connections/:id/reply
// @access  Private (Admin)
exports.getConnectionReply = async (req, res) => {
  try {
    const connectionId = req.params.id;

    // Verify connection exists and is of type 'contact'
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    if (connection.type !== 'contact') {
      return res.status(400).json({
        success: false,
        message: 'Only contact type connections can have replies',
      });
    }

    // Find ALL sent emails (replies) linked to this connection
    // This creates a conversation thread
    const replyEmails = await Email.find({
      contactId: connectionId,
      type: 'sent',
      isDeleted: false,
    })
      .sort({ createdAt: 1 }) // Oldest first for conversation flow
      .populate('userId', 'name email');

    if (!replyEmails || replyEmails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No replies found for this connection',
      });
    }

    res.json({
      success: true,
      data: replyEmails, // Return array of all replies
      count: replyEmails.length,
    });
  } catch (error) {
    console.error('Error fetching connection reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reply',
      error: error.message,
    });
  }
};
