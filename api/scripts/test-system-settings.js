const http = require('http');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const app = require('../server');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function request(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqHeaders = { ...headers };
    let postData = null;

    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data, raw: true });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING COMPLETE SYSTEM SETTINGS TEST ===\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Setup] Test server listening on port ${port}`);

  const adminToken = generateToken({ id: 2, username: 'admin', role: 'Admin', email: 'admin@royalfeast.com' });

  try {
    // 1. Public preferences endpoint test
    console.log('--- TEST 1: Public GET /api/system/preferences ---');
    const pubRes = await request(server, 'GET', '/api/system/preferences');
    console.log('Public preferences response status:', pubRes.status);
    console.log('Preferences:', pubRes.data.preferences);
    if (pubRes.status !== 200 || !pubRes.data.preferences?.application_title) {
      throw new Error('Test 1 Failed: Public preferences endpoint did not return valid preferences');
    }
    console.log('✅ TEST 1 PASSED: Public preferences accessible for theme & title hydration!\n');

    // 2. Admin GET /api/admin/system-settings
    console.log('--- TEST 2: Admin GET /api/admin/system-settings ---');
    const adminGetRes = await request(server, 'GET', '/api/admin/system-settings', {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Admin settings status:', adminGetRes.status);
    console.log('Settings:', adminGetRes.data.settings);
    console.log('Backup stats:', adminGetRes.data.backupStats);
    if (adminGetRes.status !== 200 || !adminGetRes.data.backupStats) {
      throw new Error('Test 2 Failed: System settings or backup stats missing');
    }
    console.log('✅ TEST 2 PASSED: Admin settings and diagnostic backup stats retrieved!\n');

    // 3. Admin PUT /api/admin/system-settings (Update title, theme, auto-backup, retention)
    console.log('--- TEST 3: Admin PUT /api/admin/system-settings (Dark Mode & Custom Title) ---');
    const putRes = await request(server, 'PUT', '/api/admin/system-settings', {
      'Authorization': `Bearer ${adminToken}`
    }, {
      application_title: 'Royal Feast Luxury Dining & POS',
      theme_preference: 'dark',
      auto_backup_enabled: '1',
      backup_frequency: 'daily',
      backup_retention_days: '45'
    });
    console.log('PUT status:', putRes.status);
    console.log('PUT message:', putRes.data.message);
    console.log('Updated settings:', putRes.data.settings);
    if (putRes.status !== 200 || putRes.data.settings.theme_preference !== 'dark' || putRes.data.settings.application_title !== 'Royal Feast Luxury Dining & POS') {
      throw new Error('Test 3 Failed: Settings update did not persist correctly');
    }

    // Verify database direct query
    const [dbRows] = await db.query(
      `SELECT setting_key, setting_value FROM restaurant_settings 
       WHERE setting_key IN ('application_title', 'theme_preference', 'backup_retention_days')`
    );
    const dbSettings = {};
    dbRows.forEach(r => dbSettings[r.setting_key] = r.setting_value);
    console.log('Verified database rows:', dbSettings);
    if (dbSettings.theme_preference !== 'dark' || dbSettings.application_title !== 'Royal Feast Luxury Dining & POS') {
      throw new Error('Test 3 Failed: MySQL database does not match expected values');
    }
    console.log('✅ TEST 3 PASSED: System title & dark theme updated and verified in database!\n');

    // 4. Test immediate backup execution from System Settings
    console.log('--- TEST 4: Admin POST /api/admin/system-settings/test-backup ---');
    const backupRes = await request(server, 'POST', '/api/admin/system-settings/test-backup', {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Test backup status:', backupRes.status);
    console.log('Test backup message:', backupRes.data.message);
    console.log('Backup result:', backupRes.data.backup);
    if (backupRes.status !== 200 || !backupRes.data.backup?.backupFile) {
      throw new Error('Test 4 Failed: Immediate backup test failed');
    }

    const backupFilePath = path.join(__dirname, '../../backups', backupRes.data.backup.backupFile);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Test 4 Failed: Backup file was not created on disk: ' + backupFilePath);
    }
    console.log(`Verified backup file exists on disk: ${backupFilePath} (${fs.statSync(backupFilePath).size} bytes)`);
    console.log('✅ TEST 4 PASSED: Immediate backup test executed & verified on disk!\n');

    // 5. Verify Public Preferences endpoint now reflects the updated title and dark theme
    console.log('--- TEST 5: Verify Hydration API Reflects Changes ---');
    const hydrateRes = await request(server, 'GET', '/api/system/preferences');
    console.log('Hydrated preferences:', hydrateRes.data.preferences);
    if (hydrateRes.data.preferences.application_title !== 'Royal Feast Luxury Dining & POS' || hydrateRes.data.preferences.theme_preference !== 'dark') {
      throw new Error('Test 5 Failed: Hydration API did not reflect updated title/theme');
    }
    console.log('✅ TEST 5 PASSED: Hydration API returns updated title and dark mode preference!\n');

    // 6. Reset title to standard for clean state
    console.log('--- TEST 6: Resetting Title & Theme ---');
    const resetRes = await request(server, 'PUT', '/api/admin/system-settings', {
      'Authorization': `Bearer ${adminToken}`
    }, {
      application_title: 'Royal Feast Restaurant Billing & POS',
      theme_preference: 'dark',
      auto_backup_enabled: '1',
      backup_frequency: 'daily',
      backup_retention_days: '30'
    });
    console.log('Reset response:', resetRes.data.message);
    console.log('✅ TEST 6 PASSED: Clean reset complete!\n');

    console.log('================================================================');
    console.log('🎉 ALL SYSTEM SETTINGS, TITLE & THEME TESTS PASSED 100%! 🎉');
    console.log('================================================================\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
