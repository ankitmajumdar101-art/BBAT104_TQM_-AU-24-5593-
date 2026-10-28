const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Audit and Error routes strictly require Admin or Owner (Read-Only)
router.use(authenticateToken, authorizeRoles('Admin', 'Owner'));

// ============================================================
// H. AUDIT LOGS (Section 3.2.H) - Strictly Read-Only
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { action, username, search, startDate, endDate, limit = 200 } = req.query;

    let query = `
      SELECT id, user_id, username, role, action, details, ip_address, timestamp
      FROM audit_logs
      WHERE 1=1
    `;
    const params = [];

    if (action && action !== 'All') {
      query += ` AND action = ?`;
      params.push(action);
    }

    if (username && username.trim()) {
      query += ` AND username LIKE ?`;
      params.push(`%${username.trim()}%`);
    }

    if (search && search.trim()) {
      query += ` AND (details LIKE ? OR action LIKE ? OR username LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (startDate && endDate) {
      query += ` AND DATE(timestamp) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND DATE(timestamp) >= ?`;
      params.push(startDate);
    }

    query += ` ORDER BY id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [logs] = await db.query(query, params);

    // List of distinct actions for filter dropdown
    const [actionsList] = await db.query('SELECT DISTINCT action FROM audit_logs ORDER BY action ASC');

    res.json({
      success: true,
      count: logs.length,
      availableActions: actionsList.map(a => a.action),
      logs
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// I. ERROR LOGS (Section 3.2.I) - Diagnostic & Failure Recovery
// ============================================================
router.get('/errors', async (req, res, next) => {
  try {
    const { module: mod, status, startDate, endDate, limit = 100 } = req.query;

    let query = `
      SELECT e.id, e.error_type, e.description, e.module, e.stack_trace, e.status,
             e.reviewed_by, e.resolved_at, e.timestamp,
             u.username AS reviewed_by_username
      FROM error_logs e
      LEFT JOIN users u ON e.reviewed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (mod && mod !== 'All') {
      query += ` AND e.module = ?`;
      params.push(mod);
    }

    if (status && status !== 'All') {
      query += ` AND e.status = ?`;
      params.push(status);
    }

    if (startDate && endDate) {
      query += ` AND DATE(e.timestamp) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY e.id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [errors] = await db.query(query, params);

    // Distinct modules
    const [modulesList] = await db.query('SELECT DISTINCT module FROM error_logs ORDER BY module ASC');

    res.json({
      success: true,
      count: errors.length,
      availableModules: modulesList.map(m => m.module),
      errors
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/audit/errors/:id - Mark error as Reviewed or Resolved (Section 3.2.I)
router.patch('/errors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Reviewed', 'Resolved', 'Logged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Logged, Reviewed, or Resolved.' });
    }

    const [existing] = await db.query('SELECT * FROM error_logs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Error log record not found.' });
    }

    const resolvedTime = status === 'Resolved' ? new Date() : null;

    await db.query(
      `UPDATE error_logs 
       SET status = ?, reviewed_by = ?, resolved_at = ?
       WHERE id = ?`,
      [status, req.user.id, resolvedTime, id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'REVIEW_ERROR_LOG',
      details: `Admin updated Error #${id} status to "${status}"`
    });

    res.json({
      success: true,
      message: `Error #${id} marked as "${status}".`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
