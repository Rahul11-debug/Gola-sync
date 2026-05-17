const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  thrust_area: {
    type: String,
    trim: true,
    // e.g. Technical, Sales, Leadership, Process Improvement
  },
  uom_type: {
    type: String,
    enum: ['numeric', 'percentage', 'timeline', 'zero_based', 'max_type'],
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  weightage: {
    type: Number,
    required: true,
    min: [10, 'Minimum weightage is 10%'],
    max: [100, 'Maximum weightage is 100%'],
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'locked'],
    default: 'draft',
  },
  locked: {
    type: Boolean,
    default: false,
  },
  rejection_reason: {
    type: String,
  },
  quarter: {
    type: String,
    required: true,
    // e.g. "Q1-2025"
  },
  // Shared goal reference
  shared_goal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedGoal',
    default: null,
  },
  is_read_only_title: {
    type: Boolean,
    default: false,
  },
  is_read_only_target: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
