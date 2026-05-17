const mongoose = require('mongoose');

const managerFeedbackSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quarter: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: [true, 'Feedback comment is required'],
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

module.exports = mongoose.model('ManagerFeedback', managerFeedbackSchema);
