const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['documentation', 'tutorial', 'video', 'article', 'tool'],
    default: 'documentation'
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'devops', 'design', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [{
    type: String
  }],
  assignmentMode: {
    type: String,
    enum: ['all', 'selected'],
    default: 'all'
  },
  assignedInterns: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
