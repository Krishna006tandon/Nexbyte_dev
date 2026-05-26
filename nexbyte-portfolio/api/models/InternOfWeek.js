const mongoose = require('mongoose');

const internOfWeekSchema = new mongoose.Schema(
  {
    weekKey: { type: String, required: true, unique: true, index: true }, // YYYY-MM-DD (UTC Monday)
    weekStart: { type: Date, required: true, index: true },
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    setBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternOfWeek', internOfWeekSchema);

