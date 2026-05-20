const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', TeamMemberSchema);

