const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternshipApplication',
  },
  internshipTitle: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
    index: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Internship', InternshipSchema);

