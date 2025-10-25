const mongoose = require('mongoose');

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
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Overdue', 'Verification Pending'],
    default: 'Unpaid',
  },
  transactionId: {
    type: String,
  },
  description: {
    type: String,
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bill', BillSchema);
