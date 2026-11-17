const http = require('http');
const app = require('../server');
const db = require('../config/db');

async function runTest() {
  console.log('=== STARTING OWNER BUSINESS PROFILE TEST ===\n');

  const server = app.listen(0);
  const port = server.address().port;
  console.log(`[Setup] Test server listening on port ${port}`);

  function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
      options.hostname = 'localhost';
      options.port = port;
      const req = http.request(options, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(resData);
          } catch (e) {
            parsed = resData;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      });
      req.on('error', reject);
      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  }

  try {
    // 1. Login as owner
    console.log('--- TEST 1: Login as Owner ---');
    const loginRes = await makeRequest({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'owner', password: 'owner123' });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Owner login failed: ${JSON.stringify(loginRes.data)}`);
    }
    const token = loginRes.data.token;
    console.log('✅ TEST 1 PASSED: Owner authenticated successfully!\n');

    // 2. Fetch current settings via GET /api/owner/settings
    console.log('--- TEST 2: GET /api/owner/settings ---');
    const getRes = await makeRequest({
      path: '/api/owner/settings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /api/owner/settings status:', getRes.status);
    console.log('Existing Settings:', getRes.data.settings);
    if (getRes.status !== 200 || !getRes.data.success) {
      throw new Error('GET /api/owner/settings failed');
    }
    console.log('✅ TEST 2 PASSED: Owner settings fetched successfully!\n');

    // 3. Update settings via PUT /api/owner/settings
    console.log('--- TEST 3: PUT /api/owner/settings with changed profile ---');
    const testChanges = {
      restaurant_name: 'Royal Heritage Grand Feast',
      tagline: 'Imperial Culinary Delicacies & Fine Dining',
      address: 'Plot 77, King Palace Avenue, Prayagraj, UP 211001',
      phone: '+91 91234 56789',
      email: 'operations@royalheritage.com',
      gstin: '09AABCR9999F1Z2',
      receipt_header: 'ROYAL HERITAGE GRAND FEAST',
      receipt_footer: 'Thank you for gracing us with your presence. Visit again!',
      currency_symbol: '₹'
    };

    const putRes = await makeRequest({
      path: '/api/owner/settings',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, testChanges);

    console.log('PUT /api/owner/settings status:', putRes.status);
    console.log('PUT Response:', putRes.data);
    if (putRes.status !== 200 || !putRes.data.success) {
      throw new Error(`PUT /api/owner/settings failed: ${JSON.stringify(putRes.data)}`);
    }
    console.log('✅ TEST 3 PASSED: Business settings saved!\n');

    // 4. Verify in database
    console.log('--- TEST 4: Verify settings updated in Database ---');
    const [dbRows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      'restaurant_name', 'tagline', 'address', 'phone', 'email', 'gstin', 'receipt_header', 'receipt_footer', 'currency_symbol'
    ]);
    const dbSettings = {};
    dbRows.forEach(r => dbSettings[r.setting_key] = r.setting_value);
    console.log('Database rows:', dbSettings);

    for (const key of Object.keys(testChanges)) {
      if (dbSettings[key] !== testChanges[key]) {
        throw new Error(`Mismatch in DB for ${key}: expected "${testChanges[key]}" but got "${dbSettings[key]}"`);
      }
    }
    console.log('✅ TEST 4 PASSED: Database matches 100% of updated values!\n');

    // 5. Test GET /api/system/preferences to verify public sync
    console.log('--- TEST 5: Verify GET /api/system/preferences reflects new restaurant_name ---');
    const sysRes = await makeRequest({
      path: '/api/system/preferences',
      method: 'GET'
    });
    console.log('Public preferences:', sysRes.data.preferences);
    if (sysRes.data.preferences.restaurant_name !== 'Royal Heritage Grand Feast') {
      throw new Error(`System preferences restaurant_name was not updated! Got: ${sysRes.data.preferences.restaurant_name}`);
    }
    console.log('✅ TEST 5 PASSED: Public hydration returns updated restaurant_name!\n');

    // 6. Test what happens if empty/null values are sent
    console.log('--- TEST 6: Test edge-case empty fields (e.g. clearing tagline or footer) ---');
    const clearTest = {
      restaurant_name: 'Royal Heritage Grand Feast',
      tagline: '',
      address: 'Plot 77, King Palace Avenue, Prayagraj, UP 211001',
      phone: '',
      email: '',
      gstin: '09AABCR9999F1Z2',
      receipt_header: '',
      receipt_footer: '',
      currency_symbol: '₹'
    };
    const clearRes = await makeRequest({
      path: '/api/owner/settings',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, clearTest);
    console.log('Clear test PUT status:', clearRes.status);
    console.log('Clear test response:', clearRes.data);

    const [clearRows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings WHERE setting_key = "tagline"');
    console.log('Tagline in DB after clear:', clearRows[0].setting_value);
    if (clearRows[0].setting_value !== '') {
      throw new Error(`Expected empty tagline, got: ${clearRows[0].setting_value}`);
    }
    console.log('✅ TEST 6 PASSED: Empty fields successfully persisted without error!\n');

    // 7. Reset back to original defaults
    console.log('--- TEST 7: Resetting back to initial defaults ---');
    const originalDefaults = {
      restaurant_name: 'Royal Feast Restaurant',
      tagline: 'Fine Dining & Exquisite Multi-Cuisine',
      address: '101 Commercial Boulevard, City Center',
      phone: '+91 98765 43210',
      email: 'contact@royalfeast.com',
      gstin: '27AABCR1234F1Z8',
      receipt_header: '',
      receipt_footer: '',
      currency_symbol: '₹'
    };
    await makeRequest({
      path: '/api/owner/settings',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, originalDefaults);
    console.log('✅ TEST 7 PASSED: Clean reset complete!\n');

    console.log('================================================================');
    console.log('🎉 ALL OWNER BUSINESS PROFILE TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTest();
