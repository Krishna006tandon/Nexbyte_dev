const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Basic Client Information
  clientName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  alternateEmail: { type: String },
  phone: { type: String },
  companyAddress: { type: String },
  projectName: { type: String },
  projectType: { type: String },
  projectRequirements: { type: String },
  projectDeadline: { type: Date },
  totalBudget: { type: Number },
  monthlyMaintenanceCharge: { type: Number, default: 0 },

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



  password: { type: String, required: true },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', ClientSchema);