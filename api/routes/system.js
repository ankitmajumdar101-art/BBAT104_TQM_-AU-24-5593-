const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/system/preferences - Public system preferences for client hydration
router.get('/preferences', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM restaurant_settings 
       WHERE setting_key IN (
         'application_title', 
         'theme_preference', 
         'auto_backup_enabled', 
         'backup_frequency', 
         'backup_retention_days', 
         'restaurant_name'
       )`
    );

    const preferences = {
      application_title: 'Royal Feast Restaurant Billing & POS',
      theme_preference: 'light',
      auto_backup_enabled: '1',
      backup_frequency: 'daily',
      backup_retention_days: '30',
      restaurant_name: 'Royal Feast Restaurant'
    };

    rows.forEach(r => {
      preferences[r.setting_key] = r.setting_value;
    });

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
