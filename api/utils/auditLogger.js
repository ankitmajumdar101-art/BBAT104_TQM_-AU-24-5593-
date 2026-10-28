const db = require('../config/db');

/**
 * Log user action into audit_logs table (TQM Q01 Reliability feature)
 */
async function logAudit({ userId = null, username = 'System', role = 'System', action, details = '', ipAddress = '127.0.0.1' }) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, username, role, action, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, username, role, action, details, ipAddress]
    );
  } catch (err) {
    console.error('Audit logging error:', err.message);
  }
}

module.exports = { logAudit };
