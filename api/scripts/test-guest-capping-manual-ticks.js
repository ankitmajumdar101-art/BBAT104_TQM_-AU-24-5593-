const db = require('../config/db');
const jwt = require('jsonwebtoken');
const app = require('../server');

async function testGuestCappingAndManualTicks() {
  console.log('=== STARTING GUEST CAPPING & MANUAL TICKS TEST ===\n');

  let server;
  await new Promise((resolve) => {
    server = app.listen(5000, () => {
      console.log('[Setup] Test server listening on port 5000');
      resolve();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('[Setup] Port 5000 already active, using existing server instance...');
        resolve();
      } else {
        throw err;
      }
    });
  });

  const getAuthToken = async (username) => {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) throw new Error(`User ${username} not found in DB`);
    const u = users[0];
    return jwt.sign(
      { id: u.id, username: u.username, role: u.role, full_name: u.full_name },
      process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
      { expiresIn: '1h' }
    );
  };

  const waiterToken = await getAuthToken('waiter');
  const cashierToken = await getAuthToken('cashier');

  const req = async (url, opts = {}) => {
    const res = await fetch(`http://localhost:5000${url}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    const status = res.status;
    const data = await res.json().catch(() => ({}));
    return { status, data };
  };

  // Reset Table 2 to Available with 4 chairs capacity
  await db.query(`
    UPDATE restaurant_tables
    SET status = 'Available', capacity = 4, customer_name = '', customer_phone = '', guests_count = 1, current_order_id = NULL
    WHERE table_number = 2
  `);

  // TEST 1: Attempt to seat 20 guests at Table #2 (4 chairs max) -> MUST FAIL (400)
  console.log('--- TEST 1: Attempting to seat 20 guests at 4-chair Table #2 ---');
  const fail20Res = await req('/api/waiter/tables/seat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 2,
      customer_name: 'Big Group',
      customer_phone: '9999999999',
      guests_count: 20
    })
  });
  console.log('Status:', fail20Res.status, 'Message:', fail20Res.data.message);
  if (fail20Res.status !== 400 || !fail20Res.data.message.includes('Maximum 4 guests')) {
    throw new Error('TEST 1 FAILED: Expected 400 Bad Request blocking 20 guests');
  }
  console.log('✅ TEST 1 PASSED: 20 guests strictly blocked by table capacity invariant!\n');

  // TEST 2: Attempt to seat 5 guests at Table #2 (4 chairs max) -> MUST FAIL (400)
  console.log('--- TEST 2: Attempting to seat 5 guests at 4-chair Table #2 ---');
  const fail5Res = await req('/api/waiter/tables/seat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 2,
      customer_name: 'Five Guests',
      customer_phone: '9999999999',
      guests_count: 5
    })
  });
  console.log('Status:', fail5Res.status, 'Message:', fail5Res.data.message);
  if (fail5Res.status !== 400) {
    throw new Error('TEST 2 FAILED: Expected 400 Bad Request blocking 5 guests');
  }
  console.log('✅ TEST 2 PASSED: 5 guests blocked by table capacity invariant!\n');

  // TEST 3: Seating exactly 4 guests at Table #2 (filling all 4 chairs) -> MUST SUCCEED (200)
  console.log('--- TEST 3: Seating exactly 4 guests (filling all 4 chairs) at Table #2 ---');
  const seat4Res = await req('/api/waiter/tables/seat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 2,
      customer_name: 'Ankit Majumdar',
      customer_phone: '9876543210',
      guests_count: 4
    })
  });
  console.log('Status:', seat4Res.status, 'Message:', seat4Res.data.message);
  if (seat4Res.status !== 200 || !seat4Res.data.success) {
    throw new Error('TEST 3 FAILED: Seating 4 guests should succeed');
  }

  // Verify DB state
  const [[tbl2]] = await db.query('SELECT * FROM restaurant_tables WHERE table_number = 2');
  console.log(`Table #2 status: ${tbl2.status}, guests_count: ${tbl2.guests_count}, capacity: ${tbl2.capacity}`);
  if (tbl2.status !== 'Seated' || tbl2.guests_count !== 4) {
    throw new Error('TEST 3 FAILED: Table 2 not properly seated with 4 guests');
  }
  console.log('✅ TEST 3 PASSED: Exactly 4 guests seated filling all 4 chairs!\n');

  // TEST 4: Place Order for Table #2 with chair allocation (Chair 1, Chair 2, Chair 3, Chair 4)
  console.log('--- TEST 4: Placing Order for Table #2 with Chair-by-Chair Allocation ---');
  const [menuItems] = await db.query('SELECT id, name, price FROM menu_items WHERE available = 1 LIMIT 2');
  const orderRes = await req('/api/waiter/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 2,
      customer_name: 'Ankit Majumdar',
      customer_phone: '9876543210',
      items: [
        { menu_item_id: menuItems[0].id, quantity: 1, chair_number: 1, chair_label: 'Chair 1' },
        { menu_item_id: menuItems[1].id, quantity: 1, chair_number: 2, chair_label: 'Chair 2' },
        { menu_item_id: menuItems[0].id, quantity: 1, chair_number: 3, chair_label: 'Chair 3' },
        { menu_item_id: menuItems[1].id, quantity: 1, chair_number: 4, chair_label: 'Chair 4' }
      ],
      notes: 'Test 4 chairs order'
    })
  });
  const orderId = orderRes.data.order?.id;
  console.log('Order created ID:', orderId, 'Table: #2');
  if (!orderRes.data.success || !orderId) {
    throw new Error('TEST 4 FAILED: Order creation failed');
  }
  console.log('✅ TEST 4 PASSED: Order created for 4 chairs.\n');

  // Cashier finalizes bill so bill is ready
  console.log('Finalizing bill by Cashier...');
  await req(`/api/orders/${orderId}/finalize-waiter-bill`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      payment_method: 'Cash',
      amount_received: 1000,
      discount_type: 'fixed',
      discount_value: 0
    })
  });

  // TEST 5: Waiter Manual Tick for Bill Delivery
  console.log('--- TEST 5: Waiter Manual Tick for Bill Delivered ---');
  const billTickRes = await req(`/api/waiter/orders/${orderId}/bill-delivered`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({ delivered: true })
  });
  console.log('Bill delivered response:', billTickRes.data.message);
  if (!billTickRes.data.success || !billTickRes.data.bill_delivered_to_customer) {
    throw new Error('TEST 5 FAILED: Bill delivery tick failed');
  }
  console.log('✅ TEST 5 PASSED: Bill delivered manual tick recorded!\n');

  // TEST 6: Waiter Manual Tick for Food Service
  console.log('--- TEST 6: Waiter Manual Tick for Food Served to Table & Chairs ---');
  const foodTickRes = await req(`/api/waiter/orders/${orderId}/serve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({ served: true })
  });
  console.log('Food served response:', foodTickRes.data.message);
  if (!foodTickRes.data.success || !foodTickRes.data.food_served_to_table) {
    throw new Error('TEST 6 FAILED: Food served tick failed');
  }

  // Verify Table #2 status is Served
  const [[tbl2After]] = await db.query('SELECT status FROM restaurant_tables WHERE table_number = 2');
  console.log('Table #2 status after food served tick:', tbl2After.status);
  if (tbl2After.status !== 'Served') {
    throw new Error('TEST 6 FAILED: Table status should be Served');
  }
  console.log('✅ TEST 6 PASSED: Food served manual tick recorded & Table marked Served!\n');

  // CLEANUP
  console.log('--- CLEANUP ---');
  await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
  await db.query('DELETE FROM orders WHERE id = ?', [orderId]);
  await db.query(`
    UPDATE restaurant_tables
    SET status = 'Available', customer_name = '', customer_phone = '', guests_count = 1, current_order_id = NULL
    WHERE table_number = 2
  `);
  console.log('✅ Cleanup complete.\n');

  console.log('================================================================');
  console.log('🎉 ALL GUEST CAPPING & MANUAL TICK TESTS PASSED 100%! 🎉');
  console.log('================================================================');

  if (server) server.close();
  process.exit(0);
}

testGuestCappingAndManualTicks().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
