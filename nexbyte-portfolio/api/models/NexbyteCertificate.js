const mongoose = require('mongoose');

const NexbyteCertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  programName: {
    type: String,
    required: true,
  },
  awardName: {
    type: String,
    default: null,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  internshipDuration: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Valid', 'Revoked', 'Expired'],
    default: 'Valid',
  },
  qrCodeUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'certificates_nexbyte' // Use a distinct collection name to avoid clashing with the old Certificates if it's used
});

module.exports = mongoose.model('NexbyteCertificate', NexbyteCertificateSchema);
