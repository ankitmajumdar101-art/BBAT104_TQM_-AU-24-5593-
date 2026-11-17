const http = require('http');
const app = require('../server');
const db = require('../config/db');

async function runTest() {
  console.log('=== STARTING CASHIER POS DISH IMAGES TEST ===\n');

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
    // 1. Login as Cashier
    console.log('--- TEST 1: Login as Cashier ---');
    const loginRes = await makeRequest({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'cashier', password: 'cashier123' });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Cashier login failed: ${JSON.stringify(loginRes.data)}`);
    }
    const token = loginRes.data.token;
    console.log('✅ TEST 1 PASSED: Cashier authenticated successfully!\n');

    // 2. Fetch Menu for POS Catalog
    console.log('--- TEST 2: GET /api/menu (Verify image_url present on dishes) ---');
    const menuRes = await makeRequest({
      path: '/api/menu',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (menuRes.status !== 200 || !menuRes.data.success || !Array.isArray(menuRes.data.items)) {
      throw new Error(`Failed to load menu: ${JSON.stringify(menuRes.data)}`);
    }

    const items = menuRes.data.items;
    console.log(`Loaded ${items.length} dishes in POS menu catalog.`);

    // Find popular items to verify their image URLs
    const coldCoffee = items.find(i => i.name.toLowerCase().includes('cold coffee'));
    const paneerTikka = items.find(i => i.name.toLowerCase().includes('paneer tikka'));
    const butterNaan = items.find(i => i.name.toLowerCase().includes('butter naan'));

    console.log('Sample dish image check:');
    if (coldCoffee) console.log(`- ${coldCoffee.name}: ${coldCoffee.image_url ? 'Has image URL' : 'No image URL'}`);
    if (paneerTikka) console.log(`- ${paneerTikka.name}: ${paneerTikka.image_url ? 'Has image URL' : 'No image URL'}`);
    if (butterNaan) console.log(`- ${butterNaan.name}: ${butterNaan.image_url ? 'Has image URL' : 'No image URL'}`);

    if (!coldCoffee || !coldCoffee.image_url) {
      throw new Error('Cold coffee does not have an image URL');
    }
    console.log('✅ TEST 2 PASSED: Dishes contain verified image URLs for POS display!\n');

    // 3. Create POS Bill with items and verify order_items stores & returns image_url
    console.log('--- TEST 3: Cashier POST /api/orders (Create Bill from POS) ---');
    const billOrderData = {
      table_number: 1,
      customer_name: 'Walk-in Test Guest',
      customer_phone: '+91 99999 11111',
      items: [
        { id: coldCoffee.id, name: coldCoffee.name, price: parseFloat(coldCoffee.price), quantity: 1, image_url: coldCoffee.image_url },
        { id: butterNaan.id, name: butterNaan.name, price: parseFloat(butterNaan.price), quantity: 2, image_url: butterNaan.image_url }
      ],
      discount_type: 'percentage',
      discount_value: 0,
      payment_method: 'Cash',
      amount_received: 300,
      notes: 'POS Created Bill with Dish Images'
    };

    const orderRes = await makeRequest({
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, billOrderData);

    console.log('POST /api/orders status:', orderRes.status);
    if (orderRes.status !== 201 || !orderRes.data.success) {
      throw new Error(`Order creation failed: ${JSON.stringify(orderRes.data)}`);
    }
    const createdOrder = orderRes.data.order;
    console.log(`Created Bill #${createdOrder.bill_number} (ID: ${createdOrder.id})`);

    // 4. Retrieve single order and verify items have image_url
    console.log('--- TEST 4: GET /api/orders/:id (Verify line items retain image_url) ---');
    const getOrderRes = await makeRequest({
      path: `/api/orders/${createdOrder.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getOrderRes.status !== 200 || !getOrderRes.data.success) {
      throw new Error(`Failed to fetch order: ${JSON.stringify(getOrderRes.data)}`);
    }

    const fetchedOrder = getOrderRes.data.order;
    console.log(`Order ${fetchedOrder.id} contains ${fetchedOrder.items.length} items:`);
    fetchedOrder.items.forEach(it => {
      console.log(`  • ${it.item_name} (Qty: ${it.quantity}) - Image: ${it.image_url ? 'PRESENT' : 'MISSING'}`);
      if (!it.image_url) {
        throw new Error(`Item ${it.item_name} is missing image_url!`);
      }
    });
    console.log('✅ TEST 4 PASSED: All order items include image_url for UI display!\n');

    // Clean up test order
    await db.query('DELETE FROM order_items WHERE order_id = ?', [createdOrder.id]);
    await db.query('DELETE FROM orders WHERE id = ?', [createdOrder.id]);
    console.log('✅ Cleaned up test order.\n');

    console.log('================================================================');
    console.log('🎉 ALL CASHIER POS DISH IMAGE TESTS PASSED 100%! 🎉');
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
