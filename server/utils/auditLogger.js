const AuditLog = require('../models/AuditLog');

/**
 * Log an auditable action (fire-and-forget — never blocks the request).
 *
 * @param {Object} params
 * @param {string} params.user_id
 * @param {string} params.action   - e.g. 'GOAL_APPROVED'
 * @param {string} params.entity   - e.g. 'Goal'
 * @param {string} params.entity_id
 * @param {*}      params.old_value
 * @param {*}      params.new_value
 * @param {string} params.ip_address
 */
async function auditLog({ user_id, action, entity, entity_id, old_value, new_value, ip_address }) {
  try {
    await AuditLog.create({ user_id, action, entity, entity_id, old_value, new_value, ip_address });
  } catch (err) {
    // Never let audit failure break the main flow
    console.error('Audit log error:', err.message);
  }
}

module.exports = { auditLog };
