const Email = require('../models/Email');
const Connection = require('../models/Connection');
const { sendEmail, generateEmailTemplate } = require('../services/emailService');

// @desc    Get emails by folder
// @route   GET /api/emails?folder=inbox&page=1&limit=20
// @access  Private
exports.getEmails = async (req, res) => {
  try {
    const { folder = 'inbox', page = 1, limit = 20, search, isRead, contactId } = req.query;

    // Build query
    const query = {
      userId: req.user._id,
      type: folder,
      isDeleted: false,
    };

    // Filter by contactId if provided
    if (contactId) {
      query.contactId = contactId;
    }

    if (search) {
      query.$or = [
        { 'from.name': { $regex: search, $options: 'i' } },
        { 'from.email': { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-htmlBody -body') // Exclude body for list view
      .populate('contactId', 'type'); // Populate connection to get type

    const total = await Email.countDocuments(query);

    // Get counts for all folders
    const counts = {
      inbox: await Email.countDocuments({ userId: req.user._id, type: 'inbox', isDeleted: false }),
      sent: await Email.countDocuments({ userId: req.user._id, type: 'sent', isDeleted: false }),
      draft: await Email.countDocuments({ userId: req.user._id, type: 'draft', isDeleted: false }),
      spam: await Email.countDocuments({ userId: req.user._id, type: 'spam', isDeleted: false }),
      unread: await Email.countDocuments({ userId: req.user._id, isRead: false, isDeleted: false }),
    };

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      counts,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message,
    });
  }
};

// @desc    Get reply email for a connection
// @route   GET /api/emails/connection/:connectionId/reply
// @access  Private
exports.getConnectionReply = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Find the sent email linked to this connection
    // Don't filter by userId since we want to find any admin's reply
    const replyEmail = await Email.findOne({
      contactId: connectionId,
      type: 'sent',
      isDeleted: false,
    })
      .sort({ createdAt: -1 }) // Get the most recent reply
      .populate('contactId', 'type')
      .populate('userId', 'name email'); // Also populate the user who sent it

    if (!replyEmail) {
      return res.status(404).json({
        success: false,
        message: 'No reply found for this connection',
      });
    }

    res.json({
      success: true,
      data: replyEmail,
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

// @desc    Get single email
// @route   GET /api/emails/:id
// @access  Private
exports.getEmail = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    }).populate('contactId');

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    // Mark as read if it's unread
    if (!email.isRead && email.type === 'inbox') {
      await email.markAsRead();
    }

    res.json({
      success: true,
      data: email,
    });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email',
      error: error.message,
    });
  }
};

// @desc    Send email
// @route   POST /api/emails/send
// @access  Private
exports.sendEmailMessage = async (req, res) => {
  try {
    const { to, subject, message, contactId, replyTo } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide to, subject, and message',
      });
    }

    // Get connection details if replying to a contact
    let connection = null;
    let templateData = null;
    
    if (contactId) {
      connection = await Connection.findById(contactId);
      if (connection) {
        // Prepare data for contact reply template
        templateData = {
          name: connection.fullName,
          message: connection.message,
          replyMessage: message,
          adminName: req.user.name,
        };
      }
    }

    // Send email via Nodemailer with beautiful template
    const emailResult = await sendEmail({
      to,
      subject,
      text: message,
      template: connection ? 'contactReplyTemplate' : null,
      templateData: templateData,
      html: !connection ? generateEmailTemplate(message.replace(/\n/g, '<br>')) : null,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error,
      });
    }

    // Save to sent folder
    const sentEmail = await Email.create({
      from: {
        name: req.user.name,
        email: process.env.SMTP_USER,
      },
      to: {
        email: to,
      },
      subject,
      body: message,
      htmlBody: templateData ? 'Contact Reply Template' : message,
      type: 'sent',
      userId: req.user._id,
      contactId: contactId || null,
      replyTo: replyTo || null,
      isRead: true,
      sentAt: Date.now(),
    });

    // Update connection status and reply tracking if replying to a contact
    if (contactId && connection) {
      // Increment reply count
      connection.replyCount = (connection.replyCount || 0) + 1;
      connection.lastReplyAt = Date.now();
      connection.lastReplyBy = req.user._id;
      connection.status = 'responded';
      connection.respondedBy = req.user._id;
      connection.respondedAt = Date.now();
      await connection.save();
    }

    res.status(201).json({
      success: true,
      message: 'Email sent successfully',
      data: sentEmail,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
};

// @desc    Save email as draft
// @route   POST /api/emails/draft
// @access  Private
exports.saveDraft = async (req, res) => {
  try {
    const { to, subject, message, contactId, replyTo, draftId } = req.body;

    // If draftId provided, update existing draft
    if (draftId) {
      const existingDraft = await Email.findOne({
        _id: draftId,
        userId: req.user._id,
        type: 'draft',
      });

      if (existingDraft) {
        existingDraft.to = { email: to };
        existingDraft.subject = subject || '(No Subject)';
        existingDraft.body = message || '';
        existingDraft.contactId = contactId || null;
        existingDraft.replyTo = replyTo || null;
        await existingDraft.save();

        return res.json({
          success: true,
          message: 'Draft updated successfully',
          data: existingDraft,
        });
      }
    }

    // Create new draft
    const draft = await Email.create({
      from: {
        name: req.user.name,
        email: process.env.SMTP_USER,
      },
      to: {
        email: to || '',
      },
      subject: subject || '(No Subject)',
      body: message || '',
      type: 'draft',
      userId: req.user._id,
      contactId: contactId || null,
      replyTo: replyTo || null,
      isRead: true,
    });

    res.status(201).json({
      success: true,
      message: 'Draft saved successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message,
    });
  }
};

// @desc    Mark email as read/unread
// @route   PUT /api/emails/:id/read
// @access  Private
exports.toggleReadStatus = async (req, res) => {
  try {
    const { isRead } = req.body;

    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    if (isRead) {
      await email.markAsRead();
    } else {
      await email.markAsUnread();
    }

    res.json({
      success: true,
      message: `Email marked as ${isRead ? 'read' : 'unread'}`,
      data: email,
    });
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update read status',
      error: error.message,
    });
  }
};

// @desc    Toggle star status
// @route   PUT /api/emails/:id/star
// @access  Private
exports.toggleStar = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    await email.toggleStar();

    res.json({
      success: true,
      message: `Email ${email.isStarred ? 'starred' : 'unstarred'}`,
      data: email,
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle star',
      error: error.message,
    });
  }
};

// @desc    Move email to folder
// @route   PUT /api/emails/:id/move
// @access  Private
exports.moveEmail = async (req, res) => {
  try {
    const { folder } = req.body;

    if (!['inbox', 'sent', 'draft', 'spam'].includes(folder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder',
      });
    }

    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    await email.moveToFolder(folder);

    res.json({
      success: true,
      message: `Email moved to ${folder}`,
      data: email,
    });
  } catch (error) {
    console.error('Error moving email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move email',
      error: error.message,
    });
  }
};

// @desc    Delete email
// @route   DELETE /api/emails/:id
// @access  Private
exports.deleteEmail = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    await email.softDelete();

    res.json({
      success: true,
      message: 'Email deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: error.message,
    });
  }
};

// @desc    Bulk operations
// @route   POST /api/emails/bulk
// @access  Private
exports.bulkOperation = async (req, res) => {
  try {
    const { ids, operation, value } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of email IDs',
      });
    }

    const query = {
      _id: { $in: ids },
      userId: req.user._id,
    };

    let result;

    switch (operation) {
      case 'markRead':
        result = await Email.updateMany(query, { isRead: true, readAt: Date.now() });
        break;
      case 'markUnread':
        result = await Email.updateMany(query, { isRead: false, readAt: null });
        break;
      case 'star':
        result = await Email.updateMany(query, { isStarred: true });
        break;
      case 'unstar':
        result = await Email.updateMany(query, { isStarred: false });
        break;
      case 'move':
        if (!value || !['inbox', 'sent', 'draft', 'spam'].includes(value)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid folder',
          });
        }
        result = await Email.updateMany(query, { type: value });
        break;
      case 'delete':
        result = await Email.updateMany(query, { isDeleted: true });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    res.json({
      success: true,
      message: `Bulk operation completed: ${result.modifiedCount} email(s) updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message,
    });
  }
};
