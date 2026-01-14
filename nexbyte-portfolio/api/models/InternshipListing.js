const mongoose = require('mongoose');

const InternshipListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true,
    default: 'NexByte'
  },
  location: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  skills: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['web-development', 'mobile-development', 'data-science', 'ui-ux', 'digital-marketing', 'content-writing', 'other'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  maxApplicants: {
    type: Number,
    default: 50
  },
  currentApplicants: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InternshipListing', InternshipListingSchema);
