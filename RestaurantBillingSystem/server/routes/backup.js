const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// All backup routes require Admin or Owner
router.use(authenticateToken, authorizeRoles('Admin', 'Owner'));

// POST /api/backup - Trigger a new database backup
router.post('/', async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupFileName = `restaurant_backup_${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    // Look for mysqldump in common XAMPP and Program Files paths
    const mysqldumpPaths = [
      'C:\\xampp\\mysql\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'mysqldump'
    ];

    let dumpExecutable = 'mysqldump';
    for (const p of mysqldumpPaths) {
      if (fs.existsSync(p)) {
        dumpExecutable = `"${p}"`;
        break;
      }
    }

    const dbName = process.env.DB_NAME || 'restaurant_billing_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
    const dumpCmd = `${dumpExecutable} -u ${dbUser} ${dbPass} --databases ${dbName} > "${backupFilePath}"`;

    exec(dumpCmd, async (err) => {
      let fileSizeKb = 0;
      let status = 'Success';

      if (err) {
        console.error('Backup creation error:', err.message);
        status = 'Failed';
      } else if (fs.existsSync(backupFilePath)) {
        const stats = fs.statSync(backupFilePath);
        fileSizeKb = parseFloat((stats.size / 1024).toFixed(2));
      }

      // Record in backup_logs
      await db.query(
        `INSERT INTO backup_logs (backup_file, file_size_kb, status, created_by)
         VALUES (?, ?, ?, ?)`,
        [backupFileName, fileSizeKb, status, req.user.id]
      );

      // Record in audit_logs
      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'DATABASE_BACKUP',
        details: `Created backup file ${backupFileName} (${fileSizeKb} KB) - Status: ${status}`
      });

      if (status === 'Failed') {
        return res.status(500).json({
          success: false,
          message: 'Database backup failed to execute.',
          error: err ? err.message : 'Unknown'
        });
      }

      res.status(201).json({
        success: true,
        message: `Database backup "${backupFileName}" created successfully!`,
        backup: {
          file: backupFileName,
          sizeKb: fileSizeKb,
          timestamp: new Date()
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/backup - Get backup history
router.get('/', async (req, res, next) => {
  try {
    const [backups] = await db.query(
      `SELECT b.id, b.backup_file, b.file_size_kb, b.status, b.created_at,
              u.username AS created_by_username
       FROM backup_logs b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.id DESC`
    );
    res.json({ success: true, count: backups.length, backups });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
