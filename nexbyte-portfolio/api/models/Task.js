const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
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
    enum: ['pending', 'in-progress', 'completed', 'To Do'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
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
