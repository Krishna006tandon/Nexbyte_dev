const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  certificateUrl: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    default: null
  },
  encryptedData: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', CertificateSchema);

