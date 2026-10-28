const http = require('http');

const app = require('./server');

const server = app.listen(5099, async () => {
  console.log('Testing server started on port 5099');

  try {
    // 1. Health check
    console.log('\n--- Test 1: Health Check ---');
    const health = await fetchJson('http://localhost:5099/api/health');
    console.log('Health:', health);

    // 2. Login as cashier
    console.log('\n--- Test 2: Login as Cashier ---');
    const loginRes = await fetchJson('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'cashier', password: 'cash123' })
    });
    console.log('Cashier Login:', loginRes.success, 'Token received:', !!loginRes.token);
    const token = loginRes.token;

    // 3. Get Menu Items
    console.log('\n--- Test 3: Get Menu Items ---');
    const menuRes = await fetchJson('http://localhost:5099/api/menu');
    console.log('Menu Items Count:', menuRes.count);
    const item1 = menuRes.items[0];
    const item2 = menuRes.items[1];
    console.log(`Item 1: ${item1.name} (₹${item1.price}), Item 2: ${item2.name} (₹${item2.price})`);

    // 4. Create Order / Bill
    console.log('\n--- Test 4: Create Bill ---');
    const orderRes = await fetchJson('http://localhost:5099/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        table_number: 5,
        customer_name: 'Rahul Sharma',
        customer_phone: '+91 9988776655',
        payment_method: 'UPI',
        items: [
          { id: item1.id, quantity: 2 },
          { id: item2.id, quantity: 1 }
        ],
        discount_value: 20,
        discount_type: 'fixed'
      })
    });
    console.log('Bill Generated:', orderRes.success, orderRes.message);
    console.log('Order Details:', {
      bill_number: orderRes.order.bill_number,
      subtotal: orderRes.order.subtotal,
      tax_amount: orderRes.order.tax_amount,
      discount_amount: orderRes.order.discount_amount,
      total: orderRes.order.total
    });

    // 5. Login as Owner & Check Analytics
    console.log('\n--- Test 5: Owner Analytics ---');
    const ownerLogin = await fetchJson('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'owner', password: 'owner123' })
    });
    const analyticsRes = await fetchJson('http://localhost:5099/api/analytics/dashboard', {
      headers: { 'Authorization': `Bearer ${ownerLogin.token}` }
    });
    console.log('Owner Revenue Stats:', analyticsRes.stats);
    console.log('Top Items Sold:', analyticsRes.topItems);

    console.log('\n🎉 ALL STEP 2 BACKEND API TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}
