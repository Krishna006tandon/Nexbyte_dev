const mongoose = require('mongoose');

const InternshipApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  resume: {
    type: String, // filename of uploaded resume
    required: false
  },
  coverLetter: {
    type: String,
    required: false
  },
  dateApplied: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'approved', 'rejected', 'interview', 'hired'],
    default: 'new'
  },
  notes: {
    type: String,
    required: false
  },
  interviewDate: {
    type: Date,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InternshipApplication', InternshipApplicationSchema);
