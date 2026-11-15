const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member', enum: ['admin', 'member', 'client', 'intern', 'user'] },
  name: { type: String, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  phone: { type: String, trim: true },
  bio: { type: String, trim: true },
  skills: [{ type: String }],
  credits: { type: Number, default: 0 },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' },
  },

  // Internship & offer management
  offerLetter: { type: String },
  offerStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' },
  offerAcceptedDate: { type: Date },
  offerRejectedDate: { type: Date },
  offerExpiredDate: { type: Date },
  rejectionReason: { type: String },

  internshipStartDate: { type: Date },
  internshipEndDate: { type: Date },
  acceptanceDate: { type: Date },
  internType: { type: String, enum: ['free', 'stipend'], default: 'free' },

  // Track current internship & certificate status
  internshipStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started' 
  },
  currentInternship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },

  // Internship fee payment (paid internship)
  internFeeStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid'],
    default: 'unpaid',
    index: true,
  },
  internFeeAmountInINR: { type: Number, default: 600 },
  internFeeTransactionId: { type: String },
  internFeePaidAt: { type: Date },
  internFeeRazorpayOrderId: { type: String },
  internFeeRazorpayPaymentId: { type: String },
  internFeeRazorpaySignature: { type: String },

  // Intern payment tracking (set by admin/manual verification)
  internPaymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
    index: true,
  },
  internPaymentPaidAt: { type: Date },
  internPaymentReference: { type: String },

  // Intern AI usage limits
  internGrowthAnalysisLastAt: { type: Date },
}, {
  timestamps: true
});
// admin role added for admin user

const User = mongoose.model('User', userSchema);

module.exports = User;
