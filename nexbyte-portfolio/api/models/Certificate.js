const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Stores one certificate per intern internship
const CertificateSchema = new Schema({
  intern: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internshipTitle: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Certificate', CertificateSchema);

