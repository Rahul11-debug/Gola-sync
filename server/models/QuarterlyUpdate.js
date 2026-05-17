const mongoose = require('mongoose');

const quarterlyUpdateSchema = new mongoose.Schema({
  goal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true,
  },
  quarter: {
    type: String,
    required: true,
    // e.g. "Q1-2025"
  },
  planned: {
    type: Number,
    default: 0,
  },
  actual: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['not_started', 'on_track', 'completed'],
    default: 'not_started',
  },
  progress_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completion_date: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Compound index: one update per goal per quarter
quarterlyUpdateSchema.index({ goal_id: 1, quarter: 1 }, { unique: true });

module.exports = mongoose.model('QuarterlyUpdate', quarterlyUpdateSchema);
