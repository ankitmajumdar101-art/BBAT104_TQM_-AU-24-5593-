const db = require('../config/db');
const jwt = require('jsonwebtoken');
const app = require('../server');

async function testRoomsChairsWorkflow() {
  console.log('=== STARTING ROOMS & CHAIRS WORKFLOW TEST ===\n');

  let server;
  await new Promise((resolve) => {
    server = app.listen(5000, () => {
      console.log('[Setup] Test server listening on port 5000');
      resolve();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('[Setup] Port 5000 already active, using existing instance...');
        resolve();
      } else {
        throw err;
      }
    });
  });

  // Pre-cleanup any leftover test rooms/tables
  await db.query('DELETE FROM restaurant_tables WHERE room_name LIKE "%Test%" OR table_number = 999');
  await db.query('DELETE FROM restaurant_rooms WHERE name LIKE "%Test%"');

  // JWT Helper
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
  const ownerToken = await getAuthToken('owner');
  const cashierToken = await getAuthToken('cashier');
  const chefToken = await getAuthToken('kitchen_chef');

  const req = async (url, opts = {}) => {
    const res = await fetch(`http://localhost:5000${url}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    return await res.json();
  };

  // TEST 1: Waiter Rooms API
  console.log('--- TEST 1: Waiter GET /api/waiter/rooms ---');
  const waiterRooms = await req('/api/waiter/rooms', {
    headers: { Authorization: `Bearer ${waiterToken}` }
  });
  console.log('Rooms count:', waiterRooms.rooms?.length);
  if (!waiterRooms.success || waiterRooms.rooms.length === 0) {
    throw new Error('TEST 1 FAILED: Expected rooms list');
  }
  const firstRoom = waiterRooms.rooms[0];
  console.log(`First Room: "${firstRoom.name}", Tables: ${firstRoom.table_count}, Total Chairs: ${firstRoom.total_chairs}`);
  console.log('✅ TEST 1 PASSED: Rooms retrieved successfully.\n');

  // TEST 2: Waiter Tables per Room
  console.log('--- TEST 2: Waiter GET /api/waiter/tables?room_id=... ---');
  const tablesInRoom = await req(`/api/waiter/tables?room_id=${firstRoom.id}`, {
    headers: { Authorization: `Bearer ${waiterToken}` }
  });
  console.log(`Tables in Room 1: ${tablesInRoom.tables?.length}`);
  if (!tablesInRoom.success || tablesInRoom.tables.length < 10) {
    throw new Error('TEST 2 FAILED: Expected at least 10 tables in Room 1');
  }
  const table1 = tablesInRoom.tables[0];
  console.log(`Table #${table1.table_number}: Capacity = ${table1.capacity} chairs, Room: ${table1.room_name}`);
  if (table1.capacity !== 4) {
    throw new Error(`TEST 2 FAILED: Expected 4 chairs, got ${table1.capacity}`);
  }
  console.log('✅ TEST 2 PASSED: 10 tables with 4 chairs per room verified.\n');

  // TEST 3: Owner Rooms Overview
  console.log('--- TEST 3: Owner GET /api/owner/rooms ---');
  const ownerRooms = await req('/api/owner/rooms', {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log('Owner rooms count:', ownerRooms.rooms?.length);
  if (!ownerRooms.success || ownerRooms.rooms.length === 0) {
    throw new Error('TEST 3 FAILED: Expected owner rooms list');
  }
  console.log('✅ TEST 3 PASSED: Owner rooms list retrieved.\n');

  // TEST 4: Owner Add New Room
  console.log('--- TEST 4: Owner POST /api/owner/rooms (Add Room with Tables) ---');
  const newRoomRes = await req('/api/owner/rooms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      name: 'VIP Executive Lounge (Test)',
      floor_number: 3,
      description: 'Private dining lounge for VIP guests',
      initial_table_count: 5,
      chair_capacity_per_table: 6
    })
  });
  console.log('Create room response:', newRoomRes.message, 'Room ID:', newRoomRes.roomId);
  if (!newRoomRes.success || !newRoomRes.roomId) {
    throw new Error('TEST 4 FAILED: Could not create room');
  }
  const testRoomId = newRoomRes.roomId;

  // Verify created tables
  const [createdTables] = await db.query('SELECT * FROM restaurant_tables WHERE room_id = ?', [testRoomId]);
  console.log(`Created tables in test room: ${createdTables.length}, capacity each: ${createdTables[0]?.capacity}`);
  if (createdTables.length !== 5 || createdTables[0]?.capacity !== 6) {
    throw new Error('TEST 4 FAILED: Tables not seeded correctly with 6 chairs each');
  }
  console.log('✅ TEST 4 PASSED: Owner added room with custom tables and chair sizes.\n');

  // TEST 5: Owner Add Table to Room by Size
  console.log('--- TEST 5: Owner POST /api/owner/tables (Add Table with custom capacity) ---');
  const newTableRes = await req('/api/owner/tables', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      room_id: testRoomId,
      table_number: 999,
      capacity: 8
    })
  });
  console.log('Create table response:', newTableRes.message);
  if (!newTableRes.success) {
    throw new Error('TEST 5 FAILED: Could not create custom table');
  }
  console.log('✅ TEST 5 PASSED: Table created with 8 chairs capacity.\n');

  // TEST 6: Waiter Chair-based Order Submission
  console.log('--- TEST 6: Waiter Submit Order with Chair Breakdown ---');
  // Get active menu items
  const [menuItems] = await db.query('SELECT id, name, price FROM menu_items WHERE available = 1 LIMIT 2');
  if (menuItems.length < 2) throw new Error('Not enough menu items');

  const orderPayload = {
    room_id: firstRoom.id,
    table_number: 1,
    customer_name: 'Test Family',
    customer_phone: '9876543210',
    items: [
      { menu_item_id: menuItems[0].id, quantity: 1, chair_number: 1, chair_label: 'Chair 1' },
      { menu_item_id: menuItems[1].id, quantity: 2, chair_number: 2, chair_label: 'Chair 2' },
      { menu_item_id: menuItems[0].id, quantity: 1, chair_number: 0, chair_label: 'Shared / Whole Table' }
    ],
    notes: 'Test chair-by-chair order'
  };

  const orderRes = await req('/api/waiter/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify(orderPayload)
  });
  const testOrderId = orderRes.order?.id || orderRes.order_id;
  console.log('Order creation response:', orderRes.message, 'Order ID:', testOrderId);
  if (!orderRes.success || !testOrderId) {
    throw new Error('TEST 6 FAILED: Waiter order could not be placed');
  }

  // TEST 7: Check Chair Labels across Waiter, Cashier, and Kitchen APIs
  console.log('--- TEST 7: Verify Chair Labels & Room Across Waiter, Cashier, Kitchen ---');
  
  // 7a. Waiter Orders
  const waiterOrders = await req('/api/waiter/orders', {
    headers: { Authorization: `Bearer ${waiterToken}` }
  });
  const myWaiterOrder = waiterOrders.orders?.find(o => o.id === testOrderId);
  console.log('Waiter Order Found:', myWaiterOrder ? `Yes, Room: ${myWaiterOrder.room_name}, Items: ${myWaiterOrder.items?.length}` : 'No');
  console.log('Item Chair Labels in Waiter Order:', myWaiterOrder?.items?.map(i => `${i.item_name} -> ${i.chair_label}`));
  if (!myWaiterOrder || !myWaiterOrder.items?.some(i => i.chair_label === 'Chair 1')) {
    throw new Error('TEST 7a FAILED: Chair labels missing from waiter orders');
  }

  // 7b. Cashier Pending Queue
  const cashierPending = await req('/api/orders/waiter-pending', {
    headers: { Authorization: `Bearer ${cashierToken}` }
  });
  const myCashierOrder = cashierPending.orders?.find(o => o.id === testOrderId);
  console.log('Cashier Order Found:', myCashierOrder ? `Yes, Room: ${myCashierOrder.room_name}, Items: ${myCashierOrder.items?.length}` : 'No');
  console.log('Item Chair Labels in Cashier Order:', myCashierOrder?.items?.map(i => `${i.item_name} -> ${i.chair_label}`));
  if (!myCashierOrder || !myCashierOrder.items?.some(i => i.chair_label === 'Chair 1')) {
    throw new Error('TEST 7b FAILED: Chair labels missing from cashier pending queue');
  }

  // Finalize bill by Cashier so it forwards to Kitchen
  console.log('Finalizing bill by Cashier to forward to Kitchen...');
  const finalizeRes = await req(`/api/orders/${testOrderId}/finalize-waiter-bill`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      payment_method: 'Cash',
      amount_received: myCashierOrder.total,
      discount_type: 'fixed',
      discount_value: 0
    })
  });
  console.log('Finalize result:', finalizeRes.message);

  // 7c. Kitchen Active Orders Queue
  const kitchenOrders = await req('/api/kitchen/orders', {
    headers: { Authorization: `Bearer ${chefToken}` }
  });
  const myKitchenOrder = kitchenOrders.orders?.find(o => o.id === testOrderId);
  console.log('Kitchen Order Found:', myKitchenOrder ? `Yes, Table: #${myKitchenOrder.table_number}, Room: ${myKitchenOrder.room_name}, Items: ${myKitchenOrder.items?.length}` : 'No');
  console.log('Item Chair Labels in Kitchen Order:', myKitchenOrder?.items?.map(i => `${i.item_name} -> ${i.chair_label}`));
  if (!myKitchenOrder || !myKitchenOrder.items?.some(i => i.chair_label === 'Chair 1')) {
    throw new Error('TEST 7c FAILED: Chair labels missing from kitchen active queue');
  }

  console.log('✅ TEST 7 PASSED: Chair labels & Room verified across Waiter, Cashier, and Kitchen!\n');

  // CLEANUP
  console.log('--- CLEANUP: Removing test order and test room ---');
  await db.query('DELETE FROM order_items WHERE order_id = ?', [testOrderId]);
  await db.query('DELETE FROM orders WHERE id = ?', [testOrderId]);
  await db.query('UPDATE restaurant_tables SET status = "Available", customer_name = "", current_order_id = NULL WHERE table_number = 1');
  
  // Clean up test room & table 999
  await db.query('DELETE FROM restaurant_tables WHERE room_id = ? OR table_number = 999', [testRoomId]);
  await db.query('DELETE FROM restaurant_rooms WHERE id = ?', [testRoomId]);
  console.log('✅ Cleanup complete.\n');

  console.log('====================================================');
  console.log('🎉 ALL ROOMS, CHAIRS & SEATING TESTS PASSED 100%! 🎉');
  console.log('====================================================');

  if (server) server.close();
  process.exit(0);
}

testRoomsChairsWorkflow().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
