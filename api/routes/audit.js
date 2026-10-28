const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All audit routes require Admin or Owner
router.use(authenticateToken, authorizeRoles('Admin', 'Owner'));

// GET /api/audit - List audit logs
router.get('/', async (req, res, next) => {
  try {
    const { action, username, limit = 100 } = req.query;
    let query = `
      SELECT id, user_id, username, role, action, details, ip_address, timestamp
      FROM audit_logs
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ` AND action = ?`;
      params.push(action);
    }

    if (username) {
      query += ` AND username = ?`;
      params.push(username);
    }

    query += ` ORDER BY id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [logs] = await db.query(query, params);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
});

// GET /api/audit/errors - List error logs for Developer/Maintainer
router.get('/errors', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const [errors] = await db.query(
      `SELECT id, error_type, description, module, stack_trace, timestamp
       FROM error_logs
       ORDER BY id DESC
       LIMIT ?`,
      [parseInt(limit, 10)]
    );
    res.json({ success: true, count: errors.length, errors });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
