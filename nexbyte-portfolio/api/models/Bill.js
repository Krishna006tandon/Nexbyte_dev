const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const RazorpayOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
  },
  signature: {
    type: String,
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
});

const BillSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Overdue', 'Verification Pending', 'Partially Paid'],
    default: 'Unpaid',
  },
  description: {
    type: String,
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
  pendingPayments: [PaymentSchema],
  razorpayOrders: [RazorpayOrderSchema],
});

module.exports = mongoose.model('Bill', BillSchema);
