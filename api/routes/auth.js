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
      `SELECT id, username, password, role, full_name, email, phone, status 
       FROM users 
       WHERE username = ?`,
      [username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

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
        phone: user.phone
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

module.exports = router;
