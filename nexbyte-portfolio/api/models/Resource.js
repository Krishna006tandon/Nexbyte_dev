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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
