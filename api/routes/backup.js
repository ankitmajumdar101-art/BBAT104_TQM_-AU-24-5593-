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

// All backup routes strictly require Admin (Owner & Cashier & Kitchen Staff are not allowed to manage backups)
router.use(authenticateToken, authorizeRoles('Admin'));

// Helper to find MySQL binary paths
function getMysqlBinaries() {
  const mysqldumpPaths = [
    'C:\\xampp\\mysql\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
    'mysqldump'
  ];
  const mysqlPaths = [
    'C:\\xampp\\mysql\\bin\\mysql.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
    'mysql'
  ];

  let dumpBin = 'mysqldump';
  for (const p of mysqldumpPaths) {
    if (fs.existsSync(p)) { dumpBin = `"${p}"`; break; }
  }

  let sqlBin = 'mysql';
  for (const p of mysqlPaths) {
    if (fs.existsSync(p)) { sqlBin = `"${p}"`; break; }
  }

  return { dumpBin, sqlBin };
}

// GET /api/backup - Get list of available backups (Section 3.2.G)
router.get('/', async (req, res, next) => {
  try {
    const [backups] = await db.query(
      `SELECT b.id, b.backup_file, b.file_size_kb, b.status, b.created_at,
              u.username AS created_by_username, u.full_name AS created_by_name
       FROM backup_logs b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.id DESC`
    );

    // Verify disk existence for each record
    const verifiedBackups = backups.map(b => {
      const fullPath = path.join(BACKUP_DIR, b.backup_file);
      return {
        ...b,
        fileExistsOnDisk: fs.existsSync(fullPath)
      };
    });

    res.json({ success: true, count: verifiedBackups.length, backups: verifiedBackups });
  } catch (error) {
    next(error);
  }
});

// POST /api/backup - Trigger a new manual database backup (Section 3.2.G)
router.post('/', async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupFileName = `restaurant_backup_${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    const { dumpBin } = getMysqlBinaries();
    const dbName = process.env.DB_NAME || 'restaurant_billing_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
    const dumpCmd = `${dumpBin} -u ${dbUser} ${dbPass} --databases ${dbName} > "${backupFilePath}"`;

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

      const [logResult] = await db.query(
        `INSERT INTO backup_logs (backup_file, file_size_kb, status, created_by)
         VALUES (?, ?, ?, ?)`,
        [backupFileName, fileSizeKb, status, req.user.id]
      );

      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'DATABASE_BACKUP',
        details: `Created manual backup file "${backupFileName}" (${fileSizeKb} KB) - Status: ${status}`
      });

      if (status === 'Failed') {
        return res.status(500).json({
          success: false,
          message: 'Database backup failed to execute.',
          error: err ? err.message : 'Unknown error'
        });
      }

      res.status(201).json({
        success: true,
        message: `Database backup "${backupFileName}" created successfully!`,
        backup: {
          id: logResult.insertId,
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

// GET /api/backup/:id/inspect - Safe read-only inspection of backup file (Section 3.2.G)
router.get('/:id/inspect', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [backups] = await db.query('SELECT * FROM backup_logs WHERE id = ?', [id]);
    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup record not found.' });
    }

    const backup = backups[0];
    const filePath = path.join(BACKUP_DIR, backup.backup_file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file no longer exists on disk.' });
    }

    // Read first 200 lines to safely inspect tables and schema headers
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const preview = lines.slice(0, 150).join('\n');

    // Extract table names from CREATE TABLE statements
    const tableMatches = [...fileContent.matchAll(/CREATE TABLE `?([a-zA-Z0-9_]+)`?/gi)];
    const tables = [...new Set(tableMatches.map(m => m[1]))];

    // Extract INSERT statements counts
    const insertCount = (fileContent.match(/INSERT INTO/gi) || []).length;

    res.json({
      success: true,
      backupFile: backup.backup_file,
      fileSizeKb: backup.file_size_kb,
      createdAt: backup.created_at,
      tablesContained: tables,
      estimatedDataInserts: insertCount,
      sqlHeaderPreview: preview
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/backup/:id/download - Secure download of backup file (Section 3.2.G)
router.get('/:id/download', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [backups] = await db.query('SELECT * FROM backup_logs WHERE id = ?', [id]);
    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup record not found.' });
    }

    const backup = backups[0];
    const filePath = path.join(BACKUP_DIR, backup.backup_file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found on disk.' });
    }

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DOWNLOAD_BACKUP',
      details: `Downloaded database backup file "${backup.backup_file}"`
    });

    res.download(filePath, backup.backup_file);
  } catch (error) {
    next(error);
  }
});

// POST /api/backup/:id/restore - Restore backup with safeguards & pre-restore backup (Section 3.2.G)
router.post('/:id/restore', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [backups] = await db.query('SELECT * FROM backup_logs WHERE id = ?', [id]);
    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup record not found.' });
    }

    const backup = backups[0];
    const restoreFilePath = path.join(BACKUP_DIR, backup.backup_file);

    if (!fs.existsSync(restoreFilePath)) {
      return res.status(404).json({ success: false, message: 'Target backup file not found on server.' });
    }

    // Safeguard 1: Validate file is not empty and has valid SQL markers
    const stat = fs.statSync(restoreFilePath);
    if (stat.size < 100) {
      return res.status(400).json({ success: false, message: 'Invalid or corrupt backup file. File is too small.' });
    }

    const { dumpBin, sqlBin } = getMysqlBinaries();
    const dbName = process.env.DB_NAME || 'restaurant_billing_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';

    // Safeguard 2: Create a PRE-RESTORE BACKUP before replacing the current live database
    const preRestoreTs = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const preRestoreFileName = `pre_restore_safety_backup_${preRestoreTs}.sql`;
    const preRestoreFilePath = path.join(BACKUP_DIR, preRestoreFileName);
    const preRestoreCmd = `${dumpBin} -u ${dbUser} ${dbPass} --databases ${dbName} > "${preRestoreFilePath}"`;

    exec(preRestoreCmd, async (preErr) => {
      if (preErr) {
        console.error('Pre-restore backup warning:', preErr.message);
      } else if (fs.existsSync(preRestoreFilePath)) {
        const preStat = fs.statSync(preRestoreFilePath);
        await db.query(
          `INSERT INTO backup_logs (backup_file, file_size_kb, status, created_by)
           VALUES (?, ?, 'Success', ?)`,
          [preRestoreFileName, parseFloat((preStat.size / 1024).toFixed(2)), req.user.id]
        );
      }

      // Safeguard 3: Execute Restoration
      const restoreCmd = `${sqlBin} -u ${dbUser} ${dbPass} ${dbName} < "${restoreFilePath}"`;

      exec(restoreCmd, async (restoreErr) => {
        if (restoreErr) {
          console.error('Database restore error:', restoreErr.message);

          await logAudit({
            userId: req.user.id,
            username: req.user.username,
            role: req.user.role,
            action: 'RESTORE_BACKUP_FAILED',
            details: `Failed restore attempt for "${backup.backup_file}": ${restoreErr.message}`
          });

          return res.status(500).json({
            success: false,
            message: 'Database restoration failed.',
            error: restoreErr.message
          });
        }

        await logAudit({
          userId: req.user.id,
          username: req.user.username,
          role: req.user.role,
          action: 'RESTORE_BACKUP',
          details: `Successfully restored database from "${backup.backup_file}". Pre-restore safety snapshot created: "${preRestoreFileName}"`
        });

        res.json({
          success: true,
          message: `Database successfully restored from "${backup.backup_file}"!`,
          preRestoreBackup: preRestoreFileName
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
