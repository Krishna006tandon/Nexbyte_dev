const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  certificateUrl: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  // Encrypted JSON string containing dynamic fields like
  // internName, internshipTitle, startDate, endDate, certificateId
  encryptedData: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Certificate', CertificateSchema);

