const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All user management routes strictly require Admin or Owner
router.use(authenticateToken, authorizeRoles('Admin', 'Owner'));

const VALID_ROLES = ['Owner', 'Admin', 'Cashier', 'Kitchen Staff'];

// GET /api/users - List all users with search and filters (Section 3.2.B)
router.get('/', async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    let query = `
      SELECT id, username, role, full_name, email, phone, status, 
             must_change_password, last_login, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role && role !== 'All') {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id ASC`;

    const [users] = await db.query(query, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new staff account (Section 3.2.B & 3.2.C)
router.post('/', async (req, res, next) => {
  try {
    const { 
      username, 
      password, 
      role, 
      full_name, 
      email = '', 
      phone = '', 
      require_password_change = false 
    } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Role must be one of: ${VALID_ROLES.join(', ')}.` 
      });
    }

    // Role policy: Check if an Admin account is being created
    if (role === 'Admin' && req.user.role !== 'Admin' && req.user.role !== 'Owner') {
      return res.status(403).json({
        success: false,
        message: 'Security policy: You do not have permission to create an Administrator account.'
      });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mustChange = require_password_change ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO users (username, password, role, full_name, email, phone, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [username.trim(), hashedPassword, role, (full_name || username).trim(), email.trim(), phone.trim(), mustChange]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CREATE_USER',
      details: `Created new staff user "${username.trim()}" with role "${role}" (Requires Pwd Change: ${mustChange ? 'Yes' : 'No'})`
    });

    res.status(201).json({
      success: true,
      message: `Staff account "${username.trim()}" (${role}) created successfully.`,
      userId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update staff profile / Change role / Activate / Deactivate (Section 3.2.B & 3.2.C)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, full_name, email, phone, status } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Security Safeguard: Administrators cannot deactivate the Restaurant Owner account or alter their role
    if (targetUser.role === 'Owner' && req.user.role !== 'Owner') {
      if (status === 'inactive') {
        await logAudit({
          userId: req.user.id,
          username: req.user.username,
          role: req.user.role,
          action: 'UNAUTHORIZED_OWNER_DEACTIVATE_ATTEMPT',
          details: `Blocked Admin ${req.user.username} attempt to deactivate Restaurant Owner account "${targetUser.username}".`
        });
        return res.status(403).json({
          success: false,
          message: 'Security safeguard: Administrators cannot deactivate the Restaurant Owner account.'
        });
      }
      if (role && role !== 'Owner') {
        return res.status(403).json({
          success: false,
          message: 'Security safeguard: Administrators cannot alter the role of the Restaurant Owner.'
        });
      }
    }

    // Restriction: Cannot change own role
    if (targetUser.id === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Security restriction: You cannot change your own role.' 
      });
    }

    // Role validity check
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role specified. Valid roles: ${VALID_ROLES.join(', ')}.` 
      });
    }

    // Restriction: Cannot deactivate the last active authorized administrator
    if (targetUser.role === 'Admin' && status === 'inactive') {
      const [activeAdmins] = await db.query(
        "SELECT COUNT(id) AS active_count FROM users WHERE role = 'Admin' AND status = 'active' AND id != ?",
        [id]
      );
      if (activeAdmins[0].active_count === 0) {
        return res.status(400).json({
          success: false,
          message: 'Security safeguard: Cannot deactivate the last active authorized administrator in the system.'
        });
      }
    }

    await db.query(
      `UPDATE users 
       SET role = ?, full_name = ?, email = ?, phone = ?, status = ?
       WHERE id = ?`,
      [
        role || targetUser.role,
        full_name !== undefined ? full_name.trim() : targetUser.full_name,
        email !== undefined ? email.trim() : targetUser.email,
        phone !== undefined ? phone.trim() : targetUser.phone,
        status || targetUser.status,
        id
      ]
    );

    const changes = [];
    if (role && role !== targetUser.role) changes.push(`Role changed from ${targetUser.role} to ${role}`);
    if (status && status !== targetUser.status) changes.push(`Status changed from ${targetUser.status} to ${status}`);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_USER',
      details: `Updated staff user #${id} (${targetUser.username}): ${changes.join(', ') || 'Profile details updated'}`
    });

    res.json({
      success: true,
      message: `Staff member "${targetUser.username}" updated successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:id/reset-password - Initiate secure password reset (Section 3.2.B)
router.post('/:id/reset-password', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tempPassword } = req.body;

    const [users] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Security Safeguard: Administrators cannot reset credentials for the Restaurant Owner account
    if (targetUser.role === 'Owner' && req.user.role !== 'Owner') {
      return res.status(403).json({
        success: false,
        message: 'Security safeguard: Administrators cannot reset credentials for the Restaurant Owner account. The Owner manages their own credentials.'
      });
    }

    // Generate or use provided temporary password
    const temporaryPwd = tempPassword && tempPassword.trim().length >= 6
      ? tempPassword.trim()
      : `Temp@${Math.floor(100000 + Math.random() * 900000)}`;

    const hashed = await bcrypt.hash(temporaryPwd, 10);

    // Update password and enforce must_change_password
    await db.query(
      'UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?',
      [hashed, id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'PASSWORD_RESET_INITIATED',
      details: `Admin initiated secure password reset for user "${targetUser.username}". Next login will require immediate password change.`
    });

    res.json({
      success: true,
      message: `Temporary password established for "${targetUser.username}". User must change password at next login.`,
      temporaryPassword: temporaryPwd
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Deactivate or remove user (Section 3.2.B)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const [users] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Security Safeguard: Administrators cannot delete the Restaurant Owner account
    if (targetUser.role === 'Owner' && req.user.role !== 'Owner') {
      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'UNAUTHORIZED_OWNER_DELETE_ATTEMPT',
        details: `Blocked Admin ${req.user.username} attempt to delete Restaurant Owner account "${targetUser.username}". Owner authorization required.`
      });
      return res.status(403).json({
        success: false,
        message: 'Security safeguard: Administrators cannot delete the Restaurant Owner account. The Owner is the proprietor of the restaurant and can only manage their own account.'
      });
    }

    // Guard: Cannot remove last admin
    if (targetUser.role === 'Admin') {
      const [activeAdmins] = await db.query(
        "SELECT COUNT(id) AS active_count FROM users WHERE role = 'Admin' AND status = 'active' AND id != ?",
        [id]
      );
      if (activeAdmins[0].active_count === 0) {
        return res.status(400).json({
          success: false,
          message: 'Security safeguard: Cannot delete the last active administrator.'
        });
      }
    }

    // Check if user has orders or audit records: if so, deactivate instead of hard delete to preserve audit history!
    const [orders] = await db.query('SELECT id FROM orders WHERE created_by = ? LIMIT 1', [id]);
    const [audits] = await db.query('SELECT id FROM audit_logs WHERE user_id = ? LIMIT 1', [id]);

    if (orders.length > 0 || audits.length > 0) {
      await db.query("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);
      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'DEACTIVATE_USER',
        details: `Deactivated user "${targetUser.username}" (ID #${id}) to preserve transaction and audit history`
      });
      return res.json({
        success: true,
        message: `User "${targetUser.username}" has historical records and was deactivated instead of deleted, preserving audit integrity.`
      });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_USER',
      details: `Deleted user "${targetUser.username}" (ID #${id})`
    });

    res.json({
      success: true,
      message: `User "${targetUser.username}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
