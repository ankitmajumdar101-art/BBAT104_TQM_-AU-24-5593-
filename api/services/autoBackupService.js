const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper to locate mysqldump binary
function getMysqlDumpBinary() {
  const mysqldumpPaths = [
    'C:\\xampp\\mysql\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe',
    'mysqldump'
  ];

  let dumpBin = 'mysqldump';
  for (const p of mysqldumpPaths) {
    if (fs.existsSync(p)) {
      dumpBin = `"${p}"`;
      break;
    }
  }
  return dumpBin;
}

/**
 * Creates a database backup file and records it in backup_logs & audit_logs
 */
async function createDatabaseBackup({ userId = null, username = 'Automated Scheduler', role = 'System', isAutomated = false } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const backupFileName = `restaurant_backup_${timestamp}.sql`;
      const backupFilePath = path.join(BACKUP_DIR, backupFileName);

      const dumpBin = getMysqlDumpBinary();
      const dbName = process.env.DB_NAME || 'restaurant_billing_db';
      const dbUser = process.env.DB_USER || 'root';
      const dbPass = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
      const dumpCmd = `${dumpBin} -u ${dbUser} ${dbPass} --databases ${dbName} > "${backupFilePath}"`;

      exec(dumpCmd, async (err) => {
        let fileSizeKb = 0;
        let status = 'Success';

        if (err) {
          console.error('[AutoBackupService] Backup creation error:', err.message);
          status = 'Failed';
        } else if (fs.existsSync(backupFilePath)) {
          const stats = fs.statSync(backupFilePath);
          fileSizeKb = parseFloat((stats.size / 1024).toFixed(2));
        }

        try {
          const [logResult] = await db.query(
            `INSERT INTO backup_logs (backup_file, file_size_kb, status, created_by)
             VALUES (?, ?, ?, ?)`,
            [backupFileName, fileSizeKb, status, userId]
          );

          await logAudit({
            userId: userId || null,
            username: username || 'System',
            role: role || 'System',
            action: isAutomated ? 'AUTOMATED_DATABASE_BACKUP' : 'DATABASE_BACKUP',
            details: `Created ${isAutomated ? 'scheduled auto-' : ''}backup "${backupFileName}" (${fileSizeKb} KB) - Status: ${status}`
          });

          // Run retention cleanup
          const prunedCount = await enforceBackupRetention();

          if (status === 'Failed') {
            return reject(new Error(err ? err.message : 'Database backup failed to execute'));
          }

          resolve({
            success: true,
            backupId: logResult.insertId,
            backupFile: backupFileName,
            fileSizeKb,
            prunedCount,
            createdAt: new Date()
          });
        } catch (dbErr) {
          reject(dbErr);
        }
      });
    } catch (outerErr) {
      reject(outerErr);
    }
  });
}

/**
 * Enforces the retention policy by deleting backups older than retention_days
 */
async function enforceBackupRetention() {
  try {
    const [settingRows] = await db.query(
      `SELECT setting_value FROM restaurant_settings WHERE setting_key = 'backup_retention_days'`
    );
    const retentionDays = settingRows.length > 0 ? parseInt(settingRows[0].setting_value, 10) || 30 : 30;

    // Find expired backups
    const [expiredRows] = await db.query(
      `SELECT id, backup_file FROM backup_logs 
       WHERE created_at < NOW() - INTERVAL ? DAY AND status = 'Success'`,
      [retentionDays]
    );

    let prunedCount = 0;
    for (const row of expiredRows) {
      const fullPath = path.join(BACKUP_DIR, row.backup_file);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fErr) {
          console.error(`[AutoBackupService] Error removing expired backup file ${row.backup_file}:`, fErr.message);
        }
      }
      await db.query(
        `UPDATE backup_logs SET status = 'Pruned (Retention Policy)' WHERE id = ?`,
        [row.id]
      );
      prunedCount++;
    }

    if (prunedCount > 0) {
      await logAudit({
        username: 'System Retention Worker',
        role: 'System',
        action: 'PRUNE_EXPIRED_BACKUPS',
        details: `Pruned ${prunedCount} backup files older than ${retentionDays} days retention policy threshold.`
      });
    }

    return prunedCount;
  } catch (error) {
    console.error('[AutoBackupService] Error enforcing retention:', error.message);
    return 0;
  }
}

/**
 * Fetches backup statistics and schedule status
 */
async function getBackupStats() {
  try {
    const [settings] = await db.query(
      `SELECT setting_key, setting_value FROM restaurant_settings 
       WHERE setting_key IN ('auto_backup_enabled', 'backup_frequency', 'backup_retention_days')`
    );
    const config = {
      auto_backup_enabled: '1',
      backup_frequency: 'daily',
      backup_retention_days: '30'
    };
    settings.forEach(s => { config[s.setting_key] = s.setting_value; });

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(file_size_kb), 0) as total_size_kb 
       FROM backup_logs WHERE status = 'Success'`
    );
    const [latestRows] = await db.query(
      `SELECT id, backup_file, file_size_kb, created_at, status 
       FROM backup_logs WHERE status = 'Success' ORDER BY id DESC LIMIT 1`
    );

    return {
      autoBackupEnabled: config.auto_backup_enabled === '1',
      backupFrequency: config.backup_frequency,
      backupRetentionDays: parseInt(config.backup_retention_days, 10) || 30,
      totalBackups: countRows[0]?.total || 0,
      totalSizeKb: parseFloat(countRows[0]?.total_size_kb || 0).toFixed(2),
      latestBackup: latestRows[0] || null,
      backupDir: BACKUP_DIR
    };
  } catch (error) {
    console.error('[AutoBackupService] Error getting backup stats:', error.message);
    return {
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      totalBackups: 0,
      totalSizeKb: '0.00',
      latestBackup: null,
      backupDir: BACKUP_DIR
    };
  }
}

/**
 * Hourly automated scheduler check
 */
let schedulerInterval = null;

function initAutoBackupScheduler() {
  if (schedulerInterval) return;

  console.log('⏰ [AutoBackupService] Initializing automated backup background scheduler...');

  // Run check every hour
  schedulerInterval = setInterval(async () => {
    try {
      const stats = await getBackupStats();
      if (!stats.autoBackupEnabled) return;

      const now = new Date();
      let thresholdHours = 24; // default daily
      if (stats.backupFrequency === 'weekly') thresholdHours = 24 * 7;
      if (stats.backupFrequency === 'monthly') thresholdHours = 24 * 30;

      let shouldRun = false;
      if (!stats.latestBackup) {
        shouldRun = true;
      } else {
        const lastRun = new Date(stats.latestBackup.created_at);
        const diffHours = (now - lastRun) / (1000 * 60 * 60);
        if (diffHours >= thresholdHours) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        console.log(`⏰ [AutoBackupService] Triggering scheduled auto-backup (${stats.backupFrequency})...`);
        await createDatabaseBackup({
          username: 'Automated Backup Scheduler',
          role: 'System',
          isAutomated: true
        });
      }
    } catch (err) {
      console.error('[AutoBackupService] Scheduler error:', err.message);
    }
  }, 1000 * 60 * 60); // 1 hour interval
}

module.exports = {
  createDatabaseBackup,
  enforceBackupRetention,
  getBackupStats,
  initAutoBackupScheduler,
  BACKUP_DIR
};
