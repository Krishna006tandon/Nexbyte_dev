const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member', enum: ['admin', 'member', 'client', 'intern', 'user'] },
  credits: { type: Number, default: 0 },

  // Internship & offer management
  offerLetter: { type: String },
  offerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  offerAcceptedDate: { type: Date },
  offerRejectedDate: { type: Date },
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
}, {
  timestamps: true
});
// admin role added for admin user

const User = mongoose.model('User', userSchema);

module.exports = User;
