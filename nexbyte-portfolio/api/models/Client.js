const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Basic Client Information
  clientName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  companyAddress: { type: String },

  // Project Details
  projectName: { type: String, required: true },
  projectType: { type: String },
  projectRequirements: { type: String },
  projectDeadline: { type: Date },
  totalBudget: { type: Number },

  // Billing and Payment Information
  billingAddress: { type: String },
  gstNumber: { type: String },
  paymentTerms: { type: String },
  paymentMethod: { type: String },

  // Technical Details
  domainRegistrarLogin: { type: String },
  webHostingLogin: { type: String },
  logoAndBrandingFiles: { type: String }, // Storing as a URL or path
  content: { type: String }, // Storing as a URL or path

  // SRS Document
  srsDocument: { type: String },

  password: { type: String, required: true },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', ClientSchema);