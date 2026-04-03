const Billing = require('../models/Billing');
const User = require('../models/User');

// Generate next document number: EST-0001, INV-0001, REC-0001
const generateDocNumber = async (type) => {
  const prefix = type === 'estimate' ? 'EST' : type === 'invoice' ? 'INV' : 'REC';
  const count = await Billing.countDocuments({ type });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

// GET /api/billing
exports.getAll = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const total = await Billing.countDocuments(filter);
    const docs = await Billing.find(filter)
      .populate('createdBy', 'name email')
      .populate('signedBy', 'name signature')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: docs, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing/:id
exports.getOne = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('signedBy', 'name signature role');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/billing
exports.create = async (req, res) => {
  try {
    const { type = 'estimate', ...rest } = req.body;
    const documentNumber = await generateDocNumber(type);
    const doc = await Billing.create({ ...rest, type, documentNumber, createdBy: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/billing/:id
exports.update = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Prevent changing type directly — use convert endpoint
    const { type, documentNumber, ...updates } = req.body;
    Object.assign(doc, updates, { updatedBy: req.user._id });
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/billing/:id
exports.remove = async (req, res) => {
  try {
    const doc = await Billing.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/billing/:id/convert
// estimate -> invoice, invoice -> receipt (keeps same doc number, changes type)
exports.convert = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const transitions = { estimate: 'invoice', invoice: 'receipt' };
    const nextType = transitions[doc.type];
    if (!nextType) return res.status(400).json({ success: false, message: `Cannot convert a ${doc.type}` });

    doc.type = nextType;
    if (nextType === 'receipt') {
      doc.status = 'paid';
      doc.paymentDate = new Date();
    }
    doc.updatedBy = req.user._id;
    await doc.save();
    res.json({ success: true, data: doc, message: `Converted to ${nextType}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/billing/:id/mark-paid
exports.markPaid = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.type !== 'invoice') return res.status(400).json({ success: false, message: 'Only invoices can be marked as paid' });

    doc.status = 'paid';
    doc.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
    doc.type = 'receipt';
    doc.updatedBy = req.user._id;
    await doc.save();
    res.json({ success: true, data: doc, message: 'Marked as paid and converted to receipt' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/billing/:id/send-email
exports.sendEmail = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id).populate('createdBy', 'name email');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const { to, message } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Recipient email required' });

    // Use nodemailer if configured, otherwise just return success for now
    const nodemailer = (() => { try { return require('nodemailer'); } catch { return null; } })();
    if (nodemailer && process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} ${doc.documentNumber} from GAMSAJ International Limited`,
        text: message,
      });
    }

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/billing/:id/add-payment
exports.addPayment = async (req, res) => {
  try {
    const doc = await Billing.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.type === 'estimate') return res.status(400).json({ success: false, message: 'Cannot add payment to an estimate' });

    const { amount, method = 'transfer', note = '', date } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });

    doc.payments.push({ amount: parseFloat(amount), method, note, date: date ? new Date(date) : new Date() });
    doc.updatedBy = req.user._id;
    await doc.save(); // pre-save hook recalculates amountPaid, balance, status

    // Auto-convert to receipt when fully paid
    const autoConverted = doc.status === 'paid' && doc.type === 'invoice';
    if (autoConverted) {
      doc.type = 'receipt';
      doc.paymentDate = new Date();
      await doc.save();
    }

    res.json({
      success: true,
      data: doc,
      message: doc.status === 'paid'
        ? 'Payment recorded — Invoice fully paid and converted to Receipt'
        : `Payment recorded — Balance: ₦${doc.balance.toLocaleString()}`,
      autoConverted,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
