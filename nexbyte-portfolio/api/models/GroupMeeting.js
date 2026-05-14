const mongoose = require('mongoose');

const GroupMeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    meetLink: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15, max: 480 },
    audience: {
      type: String,
      enum: ['all', 'selected'],
      default: 'all',
    },
    invitedInterns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GroupMeeting', GroupMeetingSchema);
