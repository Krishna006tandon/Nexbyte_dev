const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiarySchema = new Schema({
  intern: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['good', 'neutral', 'bad'],
    default: 'neutral'
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Diary', DiarySchema);
