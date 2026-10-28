const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All user management routes require Admin or Owner
router.use(authenticateToken, authorizeRoles('Admin', 'Owner'));

// GET /api/users - List all users
router.get('/', async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, role, full_name, email, phone, status, created_at 
       FROM users 
       ORDER BY id ASC`
    );
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res, next) => {
  try {
    const { username, password, role, full_name, email = '', phone = '' } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }
    if (!['Owner', 'Admin', 'Cashier'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be Owner, Admin, or Cashier.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (username, password, role, full_name, email, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username.trim(), hashedPassword, role, (full_name || username).trim(), email.trim(), phone.trim()]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CREATE_USER',
      details: `Created new user "${username.trim()}" with role "${role}"`
    });

    res.status(201).json({
      success: true,
      message: `User "${username.trim()}" created successfully.`,
      userId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user / Change role
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, full_name, email, phone, status, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Prevent demoting own role
    if (targetUser.id === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    let updateQuery = `
      UPDATE users 
      SET role = ?, full_name = ?, email = ?, phone = ?, status = ?
    `;
    const params = [
      role || targetUser.role,
      full_name || targetUser.full_name,
      email !== undefined ? email : targetUser.email,
      phone !== undefined ? phone : targetUser.phone,
      status || targetUser.status
    ];

    if (password && password.trim().length >= 4) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      updateQuery += `, password = ?`;
      params.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    await db.query(updateQuery, params);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_USER',
      details: `Updated user profile #${id} (${targetUser.username})`
    });

    res.json({
      success: true,
      message: `User "${targetUser.username}" updated successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const [users] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_USER',
      details: `Deleted user "${users[0].username}" (ID #${id})`
    });

    res.json({
      success: true,
      message: `User "${users[0].username}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
