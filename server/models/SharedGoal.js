const mongoose = require('mongoose');

const sharedGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  thrust_area: String,
  uom_type: {
    type: String,
    enum: ['numeric', 'percentage', 'timeline', 'zero_based', 'max_type'],
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  deadline: Date,
  quarter: {
    type: String,
    required: true,
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  linked_employee_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // When owner updates this, all linked Goal copies get their QuarterlyUpdate synced
  actual_achievement: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('SharedGoal', sharedGoalSchema);
