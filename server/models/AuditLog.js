const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    // e.g. GOAL_CREATED, GOAL_SUBMITTED, GOAL_APPROVED, GOAL_REJECTED,
    //      GOAL_LOCKED, GOAL_UNLOCKED, USER_CREATED, QUARTERLY_UPDATED
  },
  entity: {
    type: String,
    required: true,
    // e.g. 'Goal', 'User', 'QuarterlyUpdate'
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  old_value: {
    type: mongoose.Schema.Types.Mixed,
  },
  new_value: {
    type: mongoose.Schema.Types.Mixed,
  },
  ip_address: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
