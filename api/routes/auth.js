const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const [users] = await db.query(
      `SELECT id, username, password, role, full_name, email, phone, status, must_change_password, last_login 
       FROM users 
       WHERE username = ?`,
      [username.trim()]
    );

    if (users.length === 0) {
      await logAudit({
        username: username.trim(),
        role: 'Unknown',
        action: 'LOGIN_FAILED',
        details: `Failed login attempt: Username not found (${username.trim()})`,
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      await logAudit({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'LOGIN_BLOCKED',
        details: `Blocked login attempt for deactivated account (${user.username})`,
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAudit({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'LOGIN_FAILED',
        details: `Failed login attempt: Incorrect password for user ${user.username}`,
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Update last_login timestamp
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      },
      process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
      { expiresIn: '12h' }
    );

    // Audit log
    await logAudit({
      userId: user.id,
      username: user.username,
      role: user.role,
      action: 'LOGIN',
      details: `Successful login as ${user.role}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        must_change_password: Boolean(user.must_change_password),
        last_login: user.last_login
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, role, full_name, email, phone, created_at 
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/force-change-password - For users required to change temporary password
router.post('/force-change-password', authenticateToken, async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      details: `User ${req.user.username} replaced temporary password with new permanent credentials`
    });

    res.json({
      success: true,
      message: 'Password successfully updated! You can now continue.'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/change-password - For authenticated users to change their own password
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const [users] = await db.query('SELECT id, username, password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?', [hashedPassword, req.user.id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CHANGE_PASSWORD',
      details: `User ${req.user.username} updated their account password`
    });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile - Update personal profile information
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { full_name, email, phone } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name cannot be empty.' });
    }

    await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [(full_name || '').trim(), (email || '').trim(), (phone || '').trim(), req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_PROFILE',
      details: `User ${req.user.username} updated personal profile info`
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        full_name: full_name.trim(),
        email: (email || '').trim(),
        phone: (phone || '').trim()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
