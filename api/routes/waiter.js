const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Waiter routes are accessible by Waiter, Admin, and Owner
router.use(authenticateToken, authorizeRoles('Waiter', 'Admin', 'Owner'));

// Helper to get billing settings
async function getBillingSettings() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
  const settings = {
    tax_rate_cgst: 2.50,
    tax_rate_sgst: 2.50,
    currency_symbol: '₹',
    restaurant_name: 'Royal Feast Restaurant'
  };
  rows.forEach(r => {
    if (r.setting_key === 'tax_rate_cgst') settings.tax_rate_cgst = parseFloat(r.setting_value) || 2.50;
    if (r.setting_key === 'tax_rate_sgst') settings.tax_rate_sgst = parseFloat(r.setting_value) || 2.50;
    if (r.setting_key === 'restaurant_name') settings.restaurant_name = r.setting_value;
  });
  settings.total_tax_rate = parseFloat((settings.tax_rate_cgst + settings.tax_rate_sgst).toFixed(2));
  return settings;
}

// ============================================================
// 1. TABLE MANAGEMENT & SITTING SYSTEM
// ============================================================

// GET /api/waiter/tables - Get all tables with real-time status and active order summary
router.get('/tables', async (req, res, next) => {
  try {
    const [tables] = await db.query(`
      SELECT 
        t.*,
        o.bill_number,
        o.order_status,
        o.kitchen_status,
        o.total,
        o.subtotal,
        o.payment_status,
        o.bill_delivered_to_customer,
        o.food_served_to_table,
        TIMESTAMPDIFF(MINUTE, t.seated_at, NOW()) AS seated_elapsed_minutes
      FROM restaurant_tables t
      LEFT JOIN orders o ON t.current_order_id = o.id
      ORDER BY t.table_number ASC
    `);

    res.json({
      success: true,
      count: tables.length,
      tables
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/waiter/tables/seat - Seat customers at a specific table
router.post('/tables/seat', async (req, res, next) => {
  try {
    const { table_number, customer_name, customer_phone = '', guests_count = 2 } = req.body;

    if (!table_number) {
      return res.status(400).json({ success: false, message: 'Table number is required.' });
    }

    const [tableRows] = await db.query(
      'SELECT * FROM restaurant_tables WHERE table_number = ?',
      [parseInt(table_number, 10)]
    );

    if (tableRows.length === 0) {
      return res.status(404).json({ success: false, message: `Table #${table_number} does not exist.` });
    }

    const table = tableRows[0];
    if (table.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Table #${table_number} is currently "${table.status}". Please clear the table before seating new guests.`
      });
    }

    const guestName = (customer_name && customer_name.trim()) ? customer_name.trim() : 'Guest';
    const waiterName = req.user.full_name || req.user.username;

    await db.query(`
      UPDATE restaurant_tables
      SET status = 'Seated',
          customer_name = ?,
          customer_phone = ?,
          guests_count = ?,
          assigned_waiter_id = ?,
          assigned_waiter_name = ?,
          seated_at = NOW(),
          current_order_id = NULL
      WHERE table_number = ?
    `, [
      guestName,
      (customer_phone || '').trim(),
      parseInt(guests_count, 10) || 1,
      req.user.id,
      waiterName,
      parseInt(table_number, 10)
    ]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'WAITER_TABLE_SEATED',
      details: `Waiter ${waiterName} seated ${guestName} (${guests_count} guests) at Table #${table_number}`
    });

    res.json({
      success: true,
      message: `Table #${table_number} successfully assigned to ${guestName}.`,
      table_number: parseInt(table_number, 10),
      customer_name: guestName
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/waiter/tables/:table_number/clear - Clear / free table for next party
router.post('/tables/:table_number/clear', async (req, res, next) => {
  try {
    const tableNumber = parseInt(req.params.table_number, 10);

    const [tableRows] = await db.query(
      'SELECT * FROM restaurant_tables WHERE table_number = ?',
      [tableNumber]
    );

    if (tableRows.length === 0) {
      return res.status(404).json({ success: false, message: `Table #${tableNumber} not found.` });
    }

    const prevTable = tableRows[0];

    // If there is an active order on this table, mark it Completed if Billed
    if (prevTable.current_order_id) {
      await db.query(`
        UPDATE orders 
        SET order_status = 'Completed',
            food_served_to_table = 1
        WHERE id = ? AND order_status IN ('Billed', 'Pending_Cashier')
      `, [prevTable.current_order_id]);
    }

    await db.query(`
      UPDATE restaurant_tables
      SET status = 'Available',
          customer_name = '',
          customer_phone = '',
          guests_count = 1,
          assigned_waiter_id = NULL,
          assigned_waiter_name = '',
          current_order_id = NULL,
          seated_at = NULL
      WHERE table_number = ?
    `, [tableNumber]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'WAITER_TABLE_CLEARED',
      details: `Table #${tableNumber} cleared and reset to Available by ${req.user.username}`
    });

    res.json({
      success: true,
      message: `Table #${tableNumber} is now cleared and marked Available.`
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 2. MENU WITH REAL-TIME PRICES & DISCOUNTS
// ============================================================

// GET /api/waiter/menu - Full dish list with category grouping, price, and dish-specific discounts
router.get('/menu', async (req, res, next) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE status = "active" ORDER BY id ASC');
    const [items] = await db.query(`
      SELECT m.*, c.name AS category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.available = 1
      ORDER BY c.id ASC, m.name ASC
    `);

    // Process price and discounts
    const processedItems = items.map(item => {
      const price = parseFloat(item.price) || 0;
      const discountPercent = parseFloat(item.discount_percent) || 0;
      const discountAmount = parseFloat(((price * discountPercent) / 100).toFixed(2));
      const discountedPrice = parseFloat((price - discountAmount).toFixed(2));

      return {
        id: item.id,
        category_id: item.category_id,
        category_name: item.category_name,
        name: item.name,
        description: item.description,
        price: price,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        discounted_price: discountedPrice,
        has_discount: discountPercent > 0,
        available: Boolean(item.available),
        image_url: item.image_url
      };
    });

    res.json({
      success: true,
      categories,
      items: processedItems
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 3. WAITER ORDER CREATION & SUBMISSION
// Stage 1: Waiter selects items -> submits order -> forwarded to Cashier
// ============================================================

// POST /api/waiter/orders - Submit customer order for Cashier billing calculation
router.post('/orders', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      table_number,
      customer_name,
      customer_phone = '',
      items = [],
      notes = ''
    } = req.body;

    const tableNum = parseInt(table_number, 10);
    if (!tableNum) {
      return res.status(400).json({ success: false, message: 'Table number is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one dish.' });
    }

    await connection.beginTransaction();

    // Verify table exists
    const [tableRows] = await connection.query(
      'SELECT * FROM restaurant_tables WHERE table_number = ?',
      [tableNum]
    );

    if (tableRows.length === 0) {
      throw new Error(`Table #${tableNum} does not exist.`);
    }

    const table = tableRows[0];
    const guestName = (customer_name && customer_name.trim()) 
      ? customer_name.trim() 
      : (table.customer_name || `Table ${tableNum} Guest`);
    const guestPhone = (customer_phone && customer_phone.trim()) 
      ? customer_phone.trim() 
      : (table.customer_phone || '');

    // Validate items and compute subtotal using dish discounts
    let subtotal = 0;
    let totalDiscountSavings = 0;
    const verifiedItems = [];

    for (const itm of items) {
      const itmId = itm.id || itm.menu_item_id;
      const qty = parseInt(itm.quantity, 10);
      if (isNaN(qty) || qty <= 0) continue;

      const [menuRows] = await connection.query(
        'SELECT id, name, price, discount_percent, available FROM menu_items WHERE id = ?',
        [itmId]
      );

      if (menuRows.length === 0) {
        throw new Error(`Menu item ID ${itmId} was not found.`);
      }

      const menuItem = menuRows[0];
      if (!menuItem.available) {
        throw new Error(`Item "${menuItem.name}" is currently marked unavailable.`);
      }

      const originalPrice = parseFloat(menuItem.price);
      const discountPercent = parseFloat(menuItem.discount_percent) || 0;
      const discountPerItem = parseFloat(((originalPrice * discountPercent) / 100).toFixed(2));
      const effectiveItemPrice = parseFloat((originalPrice - discountPerItem).toFixed(2));
      const lineSubtotal = parseFloat((effectiveItemPrice * qty).toFixed(2));

      subtotal += lineSubtotal;
      totalDiscountSavings += parseFloat((discountPerItem * qty).toFixed(2));

      verifiedItems.push({
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        original_price: originalPrice,
        discount_percent: discountPercent,
        price: effectiveItemPrice, // Discounted unit price applied
        quantity: qty,
        subtotal: lineSubtotal
      });
    }

    if (verifiedItems.length === 0) {
      throw new Error('No valid items found to create order.');
    }

    const settings = await getBillingSettings();
    const estTax = parseFloat(((subtotal * settings.total_tax_rate) / 100).toFixed(2));
    const estTotal = parseFloat((subtotal + estTax).toFixed(2));

    const waiterName = req.user.full_name || req.user.username;
    const orderNumber = `WTR-${Date.now().toString().slice(-6)}-T${tableNum}`;

    // Insert order with status 'Pending_Cashier' & kitchen_status 'Pending_Bill'
    const [orderResult] = await connection.query(`
      INSERT INTO orders
        (bill_number, table_number, customer_name, customer_phone,
         subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount,
         total, payment_method, payment_status, order_status, kitchen_status,
         notes, created_by, waiter_id, waiter_name, table_status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, 'percentage', 0, ?, ?, 'Unpaid', 'Pending', 'Pending_Cashier', 'Pending_Bill', ?, ?, ?, ?, 'Order Placed')
    `, [
      orderNumber,
      tableNum,
      guestName,
      guestPhone,
      subtotal,
      settings.total_tax_rate,
      estTax,
      totalDiscountSavings,
      estTotal,
      (notes || '').trim(),
      req.user.id,
      req.user.id,
      waiterName
    ]);

    const orderId = orderResult.insertId;

    // Insert line items
    for (const vItem of verifiedItems) {
      await connection.query(`
        INSERT INTO order_items (order_id, menu_item_id, item_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, vItem.menu_item_id, vItem.item_name, vItem.price, vItem.quantity, vItem.subtotal]);
    }

    // Update table status to 'Order Placed' and link current order
    await connection.query(`
      UPDATE restaurant_tables
      SET status = 'Order Placed',
          customer_name = ?,
          customer_phone = ?,
          assigned_waiter_id = ?,
          assigned_waiter_name = ?,
          current_order_id = ?
      WHERE table_number = ?
    `, [guestName, guestPhone, req.user.id, waiterName, orderId, tableNum]);

    await connection.commit();

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'WAITER_SUBMIT_ORDER',
      details: `Waiter ${waiterName} submitted order #${orderNumber} for Table #${tableNum} (${verifiedItems.length} items, Est. Total: ₹${estTotal.toFixed(2)}) -> Forwarded to Cashier`
    });

    res.status(201).json({
      success: true,
      message: `Order for Table #${tableNum} submitted successfully! Forwarded to Cashier for bill generation.`,
      order: {
        id: orderId,
        order_number: orderNumber,
        table_number: tableNum,
        customer_name: guestName,
        customer_phone: guestPhone,
        waiter_name: waiterName,
        items: verifiedItems,
        subtotal,
        discount_savings: totalDiscountSavings,
        estimated_tax: estTax,
        estimated_total: estTotal,
        order_status: 'Pending_Cashier',
        kitchen_status: 'Pending_Bill'
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// ============================================================
// 4. WAITER ORDERS TRACKING & LIVE NOTIFICATIONS
// ============================================================

// GET /api/waiter/orders - Live orders tracking for waiter
router.get('/orders', async (req, res, next) => {
  try {
    const isWaiter = req.user.role === 'Waiter';
    let query = `
      SELECT 
        o.id,
        o.bill_number,
        o.table_number,
        o.customer_name,
        o.customer_phone,
        o.subtotal,
        o.tax_rate,
        o.tax_amount,
        o.discount_amount,
        o.total,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.kitchen_status,
        o.notes,
        o.waiter_id,
        o.waiter_name,
        o.bill_delivered_to_customer,
        o.food_served_to_table,
        o.created_at,
        o.kitchen_updated_at,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) AS elapsed_minutes,
        u.username AS cashier_username,
        u.full_name AS cashier_full_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Waiters see their own orders; Admin/Owner see all
    if (isWaiter) {
      query += ` AND (o.waiter_id = ? OR o.created_by = ?)`;
      params.push(req.user.id, req.user.id);
    }

    // Exclude old completed orders beyond today
    query += ` AND DATE(o.created_at) = CURDATE()`;
    query += ` ORDER BY o.id DESC LIMIT 50`;

    const [orders] = await db.query(query, params);

    // Fetch line items for each order
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT item_name, price, quantity, subtotal FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;

      // Status indicator flags for waiter UI
      order.is_awaiting_cashier = order.order_status === 'Pending_Cashier';
      order.is_bill_ready = (order.order_status === 'Completed' || order.order_status === 'Billed') && !order.bill_delivered_to_customer;
      order.is_cooking = order.kitchen_status === 'Preparing' || order.kitchen_status === 'New';
      order.is_food_ready = order.kitchen_status === 'Ready' && !order.food_served_to_table;
      order.is_fully_served = Boolean(order.food_served_to_table);
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/waiter/orders/:id/serve - Waiter marks food served to table
router.patch('/orders/:id/serve', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Mark food served
    await db.query(`
      UPDATE orders
      SET food_served_to_table = 1,
          kitchen_status = 'Completed',
          table_status = 'Served'
      WHERE id = ?
    `, [orderId]);

    // Update table status to Served
    await db.query(`
      UPDATE restaurant_tables
      SET status = 'Served'
      WHERE table_number = ?
    `, [order.table_number]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'WAITER_SERVE_FOOD',
      details: `Waiter ${req.user.username} delivered and served dishes for Table #${order.table_number} (Order #${order.bill_number})`
    });

    res.json({
      success: true,
      message: `Food marked as served to Table #${order.table_number}! Customer is dining.`
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/waiter/orders/:id/bill-delivered - Waiter marks that customer received the bill
router.patch('/orders/:id/bill-delivered', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    await db.query(`
      UPDATE orders
      SET bill_delivered_to_customer = 1
      WHERE id = ?
    `, [orderId]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'WAITER_DELIVER_BILL',
      details: `Waiter ${req.user.username} delivered printed bill #${order.bill_number} to customer at Table #${order.table_number}`
    });

    res.json({
      success: true,
      message: `Bill receipt delivered to Table #${order.table_number}.`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/waiter/notifications - Live badge counts for Waiter Dashboard
router.get('/notifications', async (req, res, next) => {
  try {
    const waiterId = req.user.id;
    const isWaiter = req.user.role === 'Waiter';

    let baseFilter = `WHERE DATE(o.created_at) = CURDATE()`;
    const params = [];
    if (isWaiter) {
      baseFilter += ` AND (o.waiter_id = ? OR o.created_by = ?)`;
      params.push(waiterId, waiterId);
    }

    // 1. Food Ready count (Chef finished preparing, food is ready at pickup counter)
    const [foodReadyRows] = await db.query(`
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.waiter_name,
             TIMESTAMPDIFF(MINUTE, o.kitchen_updated_at, NOW()) AS ready_elapsed_minutes
      FROM orders o
      ${baseFilter} AND o.kitchen_status = 'Ready' AND o.food_served_to_table = 0
    `, params);

    // 2. Bill Ready count (Cashier has finalized bill, ready for waiter to take to table)
    const [billReadyRows] = await db.query(`
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.total, o.payment_method
      FROM orders o
      ${baseFilter} AND o.order_status IN ('Completed', 'Billed') AND o.bill_delivered_to_customer = 0
    `, params);

    // 3. Pending Cashier count
    const [pendingCashierRows] = await db.query(`
      SELECT o.id, o.bill_number, o.table_number, o.customer_name
      FROM orders o
      ${baseFilter} AND o.order_status = 'Pending_Cashier'
    `, params);

    res.json({
      success: true,
      foodReadyCount: foodReadyRows.length,
      foodReadyOrders: foodReadyRows,
      billReadyCount: billReadyRows.length,
      billReadyOrders: billReadyRows,
      pendingCashierCount: pendingCashierRows.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
