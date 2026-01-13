const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member', enum: ['admin', 'member', 'client', 'intern', 'user'] },
  credits: { type: Number, default: 0 },
  offerLetter: { type: String },
  internshipStartDate: { type: Date },
  internshipEndDate: { type: Date },
  acceptanceDate: { type: Date },
  internType: { type: String, enum: ['free', 'stipend'], default: 'free' },
  // internship tracking & certificate meta
  internshipStatus: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  internshipTitle: {
    type: String,
    default: 'Internship at Nexbyte Core',
  },
  certificateId: { type: String },
  certificateUrl: { type: String },
  certificateIssuedAt: { type: Date },
});
//admin role added for admin user

const User = mongoose.model('User', userSchema);

module.exports = User;
