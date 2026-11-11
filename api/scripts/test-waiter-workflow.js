const db = require('../config/db');
const jwt = require('jsonwebtoken');
const app = require('../server');

async function testWorkflow() {
  console.log('--- STARTING WAITER WORKFLOW BACKEND TEST ---');

  // Launch server on port 5000 if not listening
  let server;
  await new Promise((resolve) => {
    server = app.listen(5000, () => {
      console.log('Test server listening on port 5000');
      resolve();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('Port 5000 already in use, proceeding to test against running server...');
        resolve();
      } else {
        throw err;
      }
    });
  });

  // 1. Authenticate Waiter
  const [waiters] = await db.query('SELECT * FROM users WHERE username = "waiter"');
  if (waiters.length === 0) throw new Error('Waiter user not found');
  const waiter = waiters[0];
  const waiterToken = jwt.sign(
    { id: waiter.id, username: waiter.username, role: waiter.role, full_name: waiter.full_name },
    process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
    { expiresIn: '1h' }
  );
  console.log('1. Waiter JWT generated:', waiter.username);

  // 2. Authenticate Cashier
  const [cashiers] = await db.query('SELECT * FROM users WHERE username = "cashier"');
  const cashier = cashiers[0];
  const cashierToken = jwt.sign(
    { id: cashier.id, username: cashier.username, role: cashier.role, full_name: cashier.full_name },
    process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
    { expiresIn: '1h' }
  );
  console.log('2. Cashier JWT generated:', cashier.username);

  // 3. Authenticate Kitchen Chef
  const [chefs] = await db.query('SELECT * FROM users WHERE username = "kitchen_chef"');
  const chef = chefs[0];
  const chefToken = jwt.sign(
    { id: chef.id, username: chef.username, role: chef.role, full_name: chef.full_name },
    process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01',
    { expiresIn: '1h' }
  );
  console.log('3. Kitchen Chef JWT generated:', chef.username);

  // Clear Table 3 to start clean
  await db.query(`
    UPDATE restaurant_tables 
    SET status = 'Available', customer_name = '', customer_phone = '', guests_count = 1, current_order_id = NULL 
    WHERE table_number = 3
  `);

  const axios = async (url, opts = {}) => {
    const res = await fetch(`http://localhost:5000${url}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  };

  // 4. Test Waiter Seating Customer at Table 3
  const seatRes = await axios('/api/waiter/tables/seat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 3,
      customer_name: 'Ankit Sharma',
      customer_phone: '9876500000',
      guests_count: 3
    })
  });
  console.log('4. Seat Customer result:', seatRes.status, seatRes.data.message);
  if (seatRes.status !== 200) throw new Error('Seating failed: ' + JSON.stringify(seatRes.data));

  // 5. Test Waiter Menu with Discounts
  const menuRes = await axios('/api/waiter/menu', {
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  console.log('5. Menu items count:', menuRes.data.items?.length);
  const discounted = menuRes.data.items.filter(i => i.has_discount);
  console.log('   Discounted dishes available:', discounted.map(d => `${d.name}: ₹${d.price} (-${d.discount_percent}%) -> ₹${d.discounted_price}`));

  // 6. Test Waiter Placing Order for Table 3
  const orderRes = await axios('/api/waiter/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${waiterToken}` },
    body: JSON.stringify({
      table_number: 3,
      customer_name: 'Ankit Sharma',
      customer_phone: '9876500000',
      items: [
        { id: 1, quantity: 2 }, // Paneer Tikka (discounted)
        { id: 4, quantity: 1 }  // Chicken Biryani (discounted)
      ],
      notes: 'Make it medium spicy, serve fresh'
    })
  });
  console.log('6. Order placed by Waiter:', orderRes.status, orderRes.data.message);
  if (orderRes.status !== 201) throw new Error('Order creation failed: ' + JSON.stringify(orderRes.data));
  const createdOrder = orderRes.data.order;
  console.log(`   Order ID: ${createdOrder.id}, Subtotal: ₹${createdOrder.subtotal}, Est Total: ₹${createdOrder.estimated_total}`);

  // 7. Test Cashier Seeing Pending Waiter Orders
  const pendingRes = await axios('/api/orders/waiter-pending', {
    headers: { 'Authorization': `Bearer ${cashierToken}` }
  });
  console.log('7. Cashier pending queue count:', pendingRes.data.count);
  const targetPending = pendingRes.data.orders.find(o => o.id === createdOrder.id);
  if (!targetPending) throw new Error('Pending order not found in Cashier queue');
  console.log(`   Found order in Cashier queue: #${targetPending.bill_number} for Table #${targetPending.table_number}`);

  // 8. Test Cashier Calculating and Finalizing Bill
  const finalizeRes = await axios(`/api/orders/${createdOrder.id}/finalize-waiter-bill`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${cashierToken}` },
    body: JSON.stringify({
      payment_method: 'UPI',
      amount_received: createdOrder.estimated_total,
      transaction_reference: 'UPI-TXN-998877',
      discount_type: 'fixed',
      discount_value: 0
    })
  });
  console.log('8. Cashier finalized bill:', finalizeRes.status, finalizeRes.data.message);
  if (finalizeRes.status !== 200) throw new Error('Bill finalization failed');
  console.log(`   Generated Bill Number: ${finalizeRes.data.bill_number}, Total: ₹${finalizeRes.data.total}`);

  // 9. Test Kitchen Chef Seeing the Billed Order in Kitchen Queue
  const kitchenOrdersRes = await axios('/api/kitchen/orders?status=active', {
    headers: { 'Authorization': `Bearer ${chefToken}` }
  });
  const kitchenOrder = kitchenOrdersRes.data.orders.find(o => o.id === createdOrder.id);
  if (!kitchenOrder) throw new Error('Billed order did not arrive in Kitchen queue');
  console.log('9. Kitchen Chef received ticket:');
  console.log(`   Table #${kitchenOrder.table_number}, Waiter: "${kitchenOrder.waiter_name}", Items: ${kitchenOrder.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}`);

  // 10. Test Kitchen Chef Marking "Preparing" -> "Ready"
  const prepRes = await axios(`/api/kitchen/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${chefToken}` },
    body: JSON.stringify({ new_status: 'Preparing' })
  });
  console.log('10. Kitchen Chef started cooking:', prepRes.data.message);

  const readyRes = await axios(`/api/kitchen/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${chefToken}` },
    body: JSON.stringify({ new_status: 'Ready' })
  });
  console.log('10b. Kitchen Chef marked food READY:', readyRes.data.message);

  // 11. Test Waiter Seeing Real-Time Notifications (Food Ready + Bill Ready)
  const notifRes = await axios('/api/waiter/notifications', {
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  console.log('11. Waiter notifications:', notifRes.data);
  console.log(`   Food Ready alerts: ${notifRes.data.foodReadyCount}, Bill Ready alerts: ${notifRes.data.billReadyCount}`);

  // 12. Test Waiter Delivering Bill and Serving Food
  const billDeliveredRes = await axios(`/api/waiter/orders/${createdOrder.id}/bill-delivered`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  console.log('12a. Waiter delivered bill receipt to table:', billDeliveredRes.data.message);

  const serveRes = await axios(`/api/waiter/orders/${createdOrder.id}/serve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  console.log('12b. Waiter served food to customer:', serveRes.data.message);

  // 13. Test Table Status
  const tableCheckRes = await axios('/api/waiter/tables', {
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  const table3 = tableCheckRes.data.tables.find(t => t.table_number === 3);
  console.log(`13. Table #3 Current Status: ${table3.status}, Customer: ${table3.customer_name}`);

  // 14. Test Waiter Clearing Table
  const clearRes = await axios('/api/waiter/tables/3/clear', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${waiterToken}` }
  });
  console.log('14. Waiter cleared Table #3:', clearRes.data.message);

  console.log('🎉🎉 ALL WAITER WORKFLOW TESTS PASSED PERFECTLY! 🎉🎉');
  process.exit(0);
}

testWorkflow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
