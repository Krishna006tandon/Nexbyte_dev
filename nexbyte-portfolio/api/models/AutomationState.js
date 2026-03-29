const mongoose = require('mongoose');

const AutomationStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    lastRunAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AutomationState', AutomationStateSchema);

