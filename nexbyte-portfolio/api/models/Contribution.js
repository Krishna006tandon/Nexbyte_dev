const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  work: { type: String, required: true },
  hours: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;
