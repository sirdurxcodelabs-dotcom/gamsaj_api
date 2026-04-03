const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 }, // per-item discount %
}, { _id: false });

lineItemSchema.virtual('lineTotal').get(function () {
  const gross = this.quantity * this.unitPrice;
  return gross - (gross * this.discount) / 100;
});

const billingSchema = new mongoose.Schema({
  documentNumber: { type: String, required: true, unique: true, trim: true },
  type: {
    type: String,
    enum: ['estimate', 'invoice', 'receipt'],
    default: 'estimate',
    required: true,
  },
  // Client info
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, trim: true, default: '' },
  clientPhone: { type: String, trim: true, default: '' },
  clientAddress: { type: String, trim: true, default: '' },

  // Line items
  items: [lineItemSchema],

  // Totals
  subtotal: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  discountValue: { type: Number, default: 0 }, // overall discount
  taxRate: { type: Number, default: 0 },       // VAT/tax %
  total: { type: Number, default: 0 },

  // Payments
  payments: [{
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'transfer', 'card'], default: 'transfer' },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
  }],
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'partial', 'paid', 'cancelled'],
    default: 'draft',
  },

  // Dates
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paymentDate: { type: Date },

  // Notes
  notes: { type: String, trim: true, default: '' },
  terms: { type: String, trim: true, default: '' },

  // Signature — which user's signature to show (if any)
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  showSignature: { type: Boolean, default: false },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-compute totals before save
billingSchema.pre('save', function (next) {
  // Line item totals
  let subtotal = 0;
  for (const item of this.items) {
    const gross = item.quantity * item.unitPrice;
    subtotal += gross - (gross * (item.discount || 0)) / 100;
  }
  this.subtotal = parseFloat(subtotal.toFixed(2));

  let afterDiscount = subtotal;
  if (this.discountValue > 0) {
    if (this.discountType === 'percent') {
      afterDiscount = subtotal - (subtotal * this.discountValue) / 100;
    } else {
      afterDiscount = subtotal - this.discountValue;
    }
  }
  const tax = (afterDiscount * (this.taxRate || 0)) / 100;
  this.total = parseFloat((afterDiscount + tax).toFixed(2));

  // Payment totals
  this.amountPaid = parseFloat(
    (this.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)
  );
  this.balance = parseFloat((this.total - this.amountPaid).toFixed(2));

  // Auto-status (only for invoice/receipt, don't override draft/sent/cancelled manually)
  if (this.type === 'invoice' || this.type === 'receipt') {
    if (this.amountPaid <= 0) {
      if (this.status !== 'cancelled' && this.status !== 'sent') this.status = 'draft';
    } else if (this.amountPaid < this.total) {
      this.status = 'partial';
    } else {
      this.status = 'paid';
    }
  }

  next();
});

module.exports = mongoose.model('Billing', billingSchema);
