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
// F. TAX AND BILLING SETTINGS (Section 3.2.F)
// ============================================================
router.get('/billing-settings', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
    const settings = {
      tax_rate_cgst: '2.50',
      tax_rate_sgst: '2.50',
      tax_calculation_mode: 'exclusive',
      max_discount_percent: '30.00',
      receipt_prefix: 'BILL',
      currency_symbol: '₹',
      currency_code: 'INR',
      billing_rounding: 'exact',
      receipt_header: 'ROYAL FEAST RESTAURANT',
      receipt_footer: 'Thank you for dining with us! Please visit again.'
    };
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

router.put('/billing-settings', async (req, res, next) => {
  try {
    const {
      tax_rate_cgst,
      tax_rate_sgst,
      tax_calculation_mode,
      max_discount_percent,
      receipt_prefix,
      currency_symbol,
      currency_code,
      billing_rounding,
      receipt_header,
      receipt_footer
    } = req.body;

    const cgst = parseFloat(tax_rate_cgst);
    const sgst = parseFloat(tax_rate_sgst);
    const maxDisc = parseFloat(max_discount_percent);

    if (isNaN(cgst) || cgst < 0 || isNaN(sgst) || sgst < 0) {
      return res.status(400).json({ success: false, message: 'Tax rates must be valid non-negative numbers.' });
    }
    if (isNaN(maxDisc) || maxDisc < 0 || maxDisc > 100) {
      return res.status(400).json({ success: false, message: 'Max discount percentage must be between 0 and 100.' });
    }

    const updates = {
      tax_rate_cgst: cgst.toFixed(2),
      tax_rate_sgst: sgst.toFixed(2),
      tax_calculation_mode: tax_calculation_mode === 'inclusive' ? 'inclusive' : 'exclusive',
      max_discount_percent: maxDisc.toFixed(2),
      receipt_prefix: (receipt_prefix || 'BILL').trim(),
      currency_symbol: (currency_symbol || '₹').trim(),
      currency_code: (currency_code || 'INR').trim(),
      billing_rounding: billing_rounding === 'nearest_rupee' ? 'nearest_rupee' : 'exact',
      receipt_header: (receipt_header || '').trim(),
      receipt_footer: (receipt_footer || '').trim()
    };

    for (const [key, val] of Object.entries(updates)) {
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
      action: 'UPDATE_BILLING_SETTINGS',
      details: `Updated billing rules: CGST ${cgst}% + SGST ${sgst}%, Max Disc: ${maxDisc}%, Rounding: ${updates.billing_rounding}`
    });

    res.json({
      success: true,
      message: 'Operational billing & tax configuration updated successfully.',
      settings: updates
    });
  } catch (error) {
    next(error);
  }
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
