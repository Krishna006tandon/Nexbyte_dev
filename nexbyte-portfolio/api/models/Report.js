const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  intern: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  skillsLearned: [{
    type: String
  }],
  performanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
