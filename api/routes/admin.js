const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes in this file strictly require the Admin role
router.use(authenticateToken, authorizeRoles('Admin'));

// ============================================================
// A. OVERVIEW DASHBOARD (Section 3.2.A)
// ============================================================
router.get('/overview', async (req, res, next) => {
  try {
    // 1. Total Active Staff Accounts
    const [activeStaffRes] = await db.query(
      "SELECT COUNT(id) AS active_staff FROM users WHERE status = 'active'"
    );

    // 2. Total Active Menu Items
    const [activeItemsRes] = await db.query(
      'SELECT COUNT(id) AS active_items FROM menu_items WHERE available = 1'
    );

    // 3. Total Bills Created Today & Operational Sales Summary
    const [todaySalesRes] = await db.query(`
      SELECT 
        COUNT(id) AS today_bills_count,
        COALESCE(SUM(total), 0) AS today_sales_amount,
        COALESCE(AVG(total), 0) AS today_avg_bill
      FROM orders
      WHERE DATE(created_at) = CURDATE()
        AND order_status = 'Completed'
    `);

    // 4. Recent Menu Updates (from audit_logs)
    const [recentMenuUpdates] = await db.query(`
      SELECT id, username, action, details, timestamp
      FROM audit_logs
      WHERE action IN ('ADD_MENU_ITEM', 'UPDATE_MENU_ITEM', 'PRICE_CHANGE', 'DELETE_MENU_ITEM', 'DEACTIVATE_MENU_ITEM')
      ORDER BY id DESC
      LIMIT 5
    `);

    // 5. Recent Staff Account Changes (from audit_logs)
    const [recentStaffChanges] = await db.query(`
      SELECT id, username, action, details, timestamp
      FROM audit_logs
      WHERE action IN ('CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER', 'PASSWORD_RESET_INITIATED', 'PASSWORD_RESET_COMPLETED')
      ORDER BY id DESC
      LIMIT 5
    `);

    // 6. Recent Backup Activity (from backup_logs)
    const [recentBackups] = await db.query(`
      SELECT b.id, b.backup_file, b.file_size_kb, b.status, b.created_at, u.username AS created_by
      FROM backup_logs b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.id DESC
      LIMIT 4
    `);

    // 7. Recent System Errors (from error_logs)
    const [recentErrors] = await db.query(`
      SELECT id, error_type, description, module, status, timestamp
      FROM error_logs
      ORDER BY id DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      overview: {
        activeStaffCount: activeStaffRes[0].active_staff,
        activeMenuItemsCount: activeItemsRes[0].active_items,
        todayBillsCount: todaySalesRes[0].today_bills_count,
        todaySalesAmount: parseFloat(todaySalesRes[0].today_sales_amount),
        todayAvgBill: parseFloat(todaySalesRes[0].today_avg_bill),
        recentMenuUpdates,
        recentStaffChanges,
        recentBackups,
        recentErrors
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// F. TAX AND BILLING SETTINGS - RESTRICTED TO OWNER
// System Administrator does not have tax configuration privileges
// ============================================================
router.all('/billing-settings', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Access Denied: Tax & Billing rules are exclusively managed by the Restaurant Owner. System Administrator is restricted to IT infrastructure and staff accounts.'
  });
});

// ============================================================
// J. SYSTEM SETTINGS (Section 3.2.J)
// ============================================================
router.get('/system-settings', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
    const settings = {
      application_title: 'Royal Feast Restaurant Billing & POS',
      theme_preference: 'light',
      auto_backup_enabled: '1',
      backup_frequency: 'daily',
      backup_retention_days: '30'
    };
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

router.put('/system-settings', async (req, res, next) => {
  try {
    const {
      application_title,
      theme_preference,
      auto_backup_enabled,
      backup_frequency,
      backup_retention_days
    } = req.body;

    const allowedUpdates = {
      application_title: application_title ? application_title.trim() : 'Royal Feast Restaurant Billing & POS',
      theme_preference: theme_preference || 'light',
      auto_backup_enabled: auto_backup_enabled ? '1' : '0',
      backup_frequency: backup_frequency || 'daily',
      backup_retention_days: String(parseInt(backup_retention_days, 10) || 30)
    };

    for (const [key, val] of Object.entries(allowedUpdates)) {
      await db.query(`
        INSERT INTO restaurant_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [key, val]);
    }

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_SYSTEM_SETTINGS',
      details: `Updated operational system settings: Auto-Backup=${allowedUpdates.auto_backup_enabled}, Retention=${allowedUpdates.backup_retention_days} days`
    });

    res.json({
      success: true,
      message: 'System operational settings updated successfully.',
      settings: allowedUpdates
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// K. PROFILE AND PASSWORD (Section 3.2.K)
// ============================================================
router.get('/profile', async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, full_name, email, phone, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Administrator account not found.' });
    }
    res.json({ success: true, profile: users[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const { full_name, email, phone } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [full_name.trim(), email ? email.trim() : '', phone ? phone.trim() : '', req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_PROFILE',
      details: `Admin updated personal profile details (${req.user.username})`
    });

    res.json({ success: true, message: 'Administrator profile updated successfully.' });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const match = await bcrypt.compare(currentPassword, users[0].password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?', [hashed, req.user.id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CHANGE_PASSWORD',
      details: `Admin changed personal password (${req.user.username})`
    });

    res.json({ success: true, message: 'Administrator password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
