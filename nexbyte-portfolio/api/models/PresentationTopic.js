const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PresentationTopicSchema = new Schema(
  {
    intern: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['assigned', 'submitted'],
      default: 'assigned',
    },
    researchPaperUrl: {
      type: String,
    },
    researchPaperPublicId: {
      type: String,
    },
    researchPaperOriginalName: {
      type: String,
    },
    submissionNotes: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PresentationTopic', PresentationTopicSchema);
