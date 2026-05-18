const mongoose = require('mongoose');

const InternshipRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    duration: { type: String, default: '3 months' },
    isActive: { type: Boolean, default: true },
    requirements: { type: String, default: '' },
    skills: { type: [String], default: [] },
    mentor: { type: String, default: '' },
    maxInterns: { type: Number, default: 3, min: 1 },
    currentInterns: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternshipRole', InternshipRoleSchema);

