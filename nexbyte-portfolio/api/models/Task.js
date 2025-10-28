const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  task_title: {
    type: String,
    required: true
  },
  task_description: {
    type: String,
    required: true
  },
  estimated_effort_hours: {
    type: Number,
    required: true
  },
  reward_amount_in_INR: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'To Do'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [
    {
      body: { type: String, required: true },
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
  }
});

module.exports = mongoose.model('Task', TaskSchema);
