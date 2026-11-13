const db = require('../config/db');
const jwt = require('jsonwebtoken');
const app = require('../server');

async function testRBAC() {
  console.log('--- STARTING OWNER MENU & ADMIN RBAC RESTRICTION TEST ---');

  // Start test server on port 5088
  let server;
  await new Promise((resolve) => {
    server = app.listen(5088, () => {
      console.log('Test server running on port 5088');
      resolve();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve();
      } else {
        throw err;
      }
    });
  });

  // Generate Admin JWT
  const [admins] = await db.query('SELECT * FROM users WHERE username = "admin"');
  const admin = admins[0];
  const adminToken = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
    { expiresIn: '1h' }
  );

  // Generate Owner JWT
  const [owners] = await db.query('SELECT * FROM users WHERE username = "owner"');
  const owner = owners[0];
  const ownerToken = jwt.sign(
    { id: owner.id, username: owner.username, role: owner.role },
    process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
    { expiresIn: '1h' }
  );

  const request = async (path, options = {}) => {
    const res = await fetch(`http://localhost:5088${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  };

  // Test 1: Admin attempts to add a menu item (MUST FAIL with 403 Forbidden)
  console.log('\nTest 1: Admin attempts to add menu item...');
  const adminAddRes = await request('/api/menu', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Admin Test Dish',
      category_id: 1,
      price: 199
    })
  });
  console.log(`Status: ${adminAddRes.status} (Expected 403)`);
  if (adminAddRes.status !== 403) {
    throw new Error(`Admin was unexpectedly able to add menu item! Status: ${adminAddRes.status}`);
  }
  console.log('✅ PASS: Admin blocked from adding menu items.');

  // Test 2: Admin attempts to access tax & billing settings (MUST FAIL with 403 Forbidden)
  console.log('\nTest 2: Admin attempts to access tax & billing settings...');
  const adminBillingRes = await request('/api/admin/billing-settings', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`Status: ${adminBillingRes.status} (Expected 403)`);
  if (adminBillingRes.status !== 403) {
    throw new Error(`Admin was unexpectedly able to access billing settings! Status: ${adminBillingRes.status}`);
  }
  console.log('✅ PASS: Admin blocked from billing & tax configuration.');

  // Test 3: Restaurant Owner adds a new dish with customer discount/offer
  console.log('\nTest 3: Restaurant Owner adds a new dish with discount...');
  const ownerAddRes = await request('/api/menu', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ownerToken}` },
    body: JSON.stringify({
      name: 'Owner Signature Kebab',
      category_id: 1,
      price: 350.00,
      discount_percent: 20.00,
      description: 'Exclusive chef marinated succulent kebabs'
    })
  });
  console.log(`Status: ${ownerAddRes.status}, Message: ${ownerAddRes.data.message}`);
  if (ownerAddRes.status !== 201) {
    throw new Error(`Owner failed to add dish! Status: ${ownerAddRes.status}`);
  }
  const createdItemId = ownerAddRes.data.itemId;
  console.log(`✅ PASS: Owner added dish ID: ${createdItemId}`);

  // Test 4: Restaurant Owner updates customer discount/offer percentage
  console.log('\nTest 4: Restaurant Owner updates customer discount offer...');
  const ownerOfferRes = await request(`/api/menu/${createdItemId}/discount`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${ownerToken}` },
    body: JSON.stringify({ discount_percent: 25.00 })
  });
  console.log(`Status: ${ownerOfferRes.status}, Message: ${ownerOfferRes.data.message}`);
  if (ownerOfferRes.status !== 200 || ownerOfferRes.data.offer_price !== 262.50) {
    throw new Error(`Failed to update customer offer! Result: ${JSON.stringify(ownerOfferRes.data)}`);
  }
  console.log(`✅ PASS: Offer updated to 25% OFF! Customer pays ₹${ownerOfferRes.data.offer_price}`);

  // Test 5: Restaurant Owner updates tax & billing settings
  console.log('\nTest 5: Restaurant Owner updates tax & billing settings...');
  const ownerBillingRes = await request('/api/owner/billing-settings', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${ownerToken}` },
    body: JSON.stringify({
      tax_rate_cgst: '2.50',
      tax_rate_sgst: '2.50',
      max_discount_percent: '30.00',
      billing_rounding: 'exact'
    })
  });
  console.log(`Status: ${ownerBillingRes.status}, Message: ${ownerBillingRes.data.message}`);
  if (ownerBillingRes.status !== 200) {
    throw new Error(`Owner failed to update billing settings! Status: ${ownerBillingRes.status}`);
  }
  console.log('✅ PASS: Owner successfully updated tax & billing settings.');

  // Test 6: Restaurant Owner removes the dish
  console.log('\nTest 6: Restaurant Owner removes the dish...');
  const ownerDeleteRes = await request(`/api/menu/${createdItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${ownerToken}` }
  });
  console.log(`Status: ${ownerDeleteRes.status}, Message: ${ownerDeleteRes.data.message}`);
  if (ownerDeleteRes.status !== 200) {
    throw new Error(`Owner failed to delete dish! Status: ${ownerDeleteRes.status}`);
  }
  console.log('✅ PASS: Owner successfully removed dish.');

  // Test 7: Admin still retains full system administration (User accounts, backups, audit logs)
  console.log('\nTest 7: Admin system administration privileges verification...');
  const adminUsersRes = await request('/api/users', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`Admin Users Access: ${adminUsersRes.status === 200 ? 'YES' : 'NO'} (${adminUsersRes.data.count} users)`);
  if (adminUsersRes.status !== 200) throw new Error('Admin failed to access users');

  const adminBackupsRes = await request('/api/backup', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`Admin Backups Access: ${adminBackupsRes.status === 200 ? 'YES' : 'NO'}`);
  if (adminBackupsRes.status !== 200) throw new Error('Admin failed to access backups');

  console.log('\n🎉🎉 ALL RBAC PRIVILEGE SEPARATION TESTS PASSED PERFECTLY! 🎉🎉\n');
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

testRBAC().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
