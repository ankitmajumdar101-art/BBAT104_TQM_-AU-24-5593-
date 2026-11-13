const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../server');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant_billing_super_secret_jwt_key_2026_q01';
const PORT = 5089;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    console.log('\n--- STARTING DISH IMAGE & VISUAL ORDER VERIFICATION TEST ---');

    const ownerToken = generateToken({ id: 1, username: 'owner', role: 'Owner' });
    const cashierToken = generateToken({ id: 3, username: 'cashier', role: 'Cashier' });
    const waiterToken = generateToken({ id: 9, username: 'waiter', role: 'Waiter', full_name: 'Floor Waiter' });
    const kitchenToken = generateToken({ id: 7, username: 'kitchen_chef', role: 'Kitchen Staff' });

    // Test 1: GET /api/menu returns image_url on items
    console.log('\nTest 1: Verify GET /api/menu returns image_url for menu items...');
    const menuRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/menu',
      method: 'GET'
    });
    if (menuRes.status !== 200 || !menuRes.data.success) {
      throw new Error(`Failed to fetch menu: ${JSON.stringify(menuRes.data)}`);
    }
    const items = menuRes.data.items;
    const itemsWithImages = items.filter(i => i.image_url && i.image_url.startsWith('http'));
    console.log(`Total Menu Items: ${items.length}, Items with verified Image URLs: ${itemsWithImages.length}`);
    if (itemsWithImages.length === 0) {
      throw new Error('Expected menu items to have non-empty image_url');
    }
    console.log(`✅ PASS: Dish images are present across menu items! Sample: "${items[0].name}" -> ${items[0].image_url.substring(0, 50)}...`);

    // Test 2: GET /api/waiter/menu returns image_url
    console.log('\nTest 2: Verify Waiter menu returns image_url...');
    const waiterMenuRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/waiter/menu',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${waiterToken}` }
    });
    if (waiterMenuRes.status !== 200 || !waiterMenuRes.data.success) {
      throw new Error(`Failed to fetch waiter menu: ${JSON.stringify(waiterMenuRes.data)}`);
    }
    const waiterItemsWithImages = waiterMenuRes.data.items.filter(i => i.image_url);
    console.log(`Waiter Menu Items: ${waiterMenuRes.data.items.length}, with image_url: ${waiterItemsWithImages.length}`);
    if (waiterItemsWithImages.length === 0) {
      throw new Error('Expected waiter menu items to include image_url');
    }
    console.log('✅ PASS: Waiter menu returns dish image URLs for customer visual ordering.');

    // Test 3: Waiter creates order and dish image propagates to order items
    console.log('\nTest 3: Waiter submits order with dishes...');
    const targetDish = items[0];
    const waiterOrderRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/waiter/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${waiterToken}`
      }
    }, {
      table_number: 7,
      customer_name: 'Visual Menu Guest',
      customer_phone: '9876543210',
      items: [
        { id: targetDish.id, quantity: 2 }
      ],
      notes: 'Extra crispy'
    });

    if (waiterOrderRes.status !== 201) {
      throw new Error(`Failed to create waiter order: ${JSON.stringify(waiterOrderRes.data)}`);
    }
    const createdOrderId = waiterOrderRes.data.order.id;
    console.log(`✅ PASS: Waiter created order #${createdOrderId} with dish "${targetDish.name}".`);

    // Test 4: Cashier Waiter Queue receives dish image_url
    console.log('\nTest 4: Verify Cashier incoming waiter queue receives dish image_url...');
    const queueRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders/waiter-pending',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    if (queueRes.status !== 200) {
      throw new Error(`Failed to fetch waiter pending queue: ${JSON.stringify(queueRes.data)}`);
    }
    const pendingOrder = queueRes.data.orders.find(o => o.id === createdOrderId);
    if (!pendingOrder || !pendingOrder.items || pendingOrder.items.length === 0) {
      throw new Error('Created order not found in waiter-pending queue');
    }
    const queueItemImage = pendingOrder.items[0].image_url;
    console.log(`Queue item image: ${queueItemImage ? queueItemImage.substring(0, 50) + '...' : 'NONE'}`);
    if (!queueItemImage) {
      throw new Error('Expected waiter-pending order items to include image_url');
    }
    console.log('✅ PASS: Cashier incoming queue displays dish image thumbnails!');

    // Test 5: Finalize bill & Verify Kitchen KDS receives dish image_url
    console.log('\nTest 5: Finalize bill & verify Kitchen KDS receives dish image_url...');
    const finalizeRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/orders/${createdOrderId}/finalize-waiter-bill`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cashierToken}`
      }
    }, {
      payment_method: 'Cash',
      amount_received: 600
    });
    if (finalizeRes.status !== 200) {
      throw new Error(`Failed to finalize bill: ${JSON.stringify(finalizeRes.data)}`);
    }

    const kdsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/kitchen/orders?status=active',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${kitchenToken}` }
    });
    if (kdsRes.status !== 200) {
      throw new Error(`Failed to fetch kitchen orders: ${JSON.stringify(kdsRes.data)}`);
    }
    const kdsOrder = kdsRes.data.orders.find(o => o.id === createdOrderId);
    if (!kdsOrder || !kdsOrder.items || kdsOrder.items.length === 0) {
      throw new Error('Billed order not found on Kitchen KDS');
    }
    const kdsItemImage = kdsOrder.items[0].image_url;
    console.log(`KDS item image: ${kdsItemImage ? kdsItemImage.substring(0, 50) + '...' : 'NONE'}`);
    if (!kdsItemImage) {
      throw new Error('Expected KDS order line items to have image_url');
    }
    console.log('✅ PASS: Kitchen KDS cards display dish image thumbnails for chefs!');

    // Test 6: Restaurant Owner updates dish image URL
    console.log('\nTest 6: Owner updates dish with a custom image URL...');
    const originalImage = targetDish.image_url;
    const testCustomImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
    const updateRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/menu/${targetDish.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      }
    }, {
      name: targetDish.name,
      category_id: targetDish.category_id,
      price: targetDish.price,
      discount_percent: targetDish.discount_percent,
      image_url: testCustomImage
    });
    if (updateRes.status !== 200) {
      throw new Error(`Failed to update dish image: ${JSON.stringify(updateRes.data)}`);
    }

    const [dbCheck] = await db.query('SELECT image_url FROM menu_items WHERE id = ?', [targetDish.id]);
    if (dbCheck[0].image_url !== testCustomImage) {
      throw new Error(`Database image_url mismatch: ${dbCheck[0].image_url}`);
    }
    console.log(`✅ PASS: Restaurant Owner successfully updated dish image URL!`);

    // Restore original dish image immediately so tests never corrupt live menu
    await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/menu/${targetDish.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      }
    }, {
      name: targetDish.name,
      category_id: targetDish.category_id,
      price: targetDish.price,
      discount_percent: targetDish.discount_percent,
      image_url: originalImage
    });
    console.log(`✅ RESTORED: Successfully restored original dish image for "${targetDish.name}".`);

    console.log('\n🎉🎉 ALL 6 DISH IMAGE & VISUAL ORDER TESTS PASSED PERFECTLY! 🎉🎉\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
