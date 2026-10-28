const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// POST /api/orders - Create a new bill (Cashier and Admin only; Owner is strictly read-only)
router.post('/', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      table_number = 1,
      customer_name = 'Walk-in Customer',
      customer_phone = '',
      items = [],
      discount_type = 'fixed',
      discount_value = 0,
      payment_method = 'Cash',
      notes = ''
    } = req.body;

    // Input Validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate an empty bill. Please add at least one item.'
      });
    }

    await connection.beginTransaction();

    // Verify each item and recalculate subtotal server-side to guarantee integrity
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        throw new Error(`Invalid quantity for item "${item.name || item.id}".`);
      }

      const [menuRows] = await connection.query(
        'SELECT id, name, price, available FROM menu_items WHERE id = ?',
        [item.id || item.menu_item_id]
      );

      if (menuRows.length === 0) {
        throw new Error(`Menu item with ID ${item.id} does not exist.`);
      }

      const menuItem = menuRows[0];
      const itemPrice = parseFloat(menuItem.price);
      const itemSubtotal = itemPrice * qty;
      subtotal += itemSubtotal;

      verifiedItems.push({
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        price: itemPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

    // 5% GST (2.5% CGST + 2.5% SGST)
    const taxRate = 5.00;
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));

    // Calculate discount
    let discountAmount = 0;
    const discVal = parseFloat(discount_value) || 0;
    if (discount_type === 'percentage') {
      discountAmount = parseFloat(((subtotal * discVal) / 100).toFixed(2));
    } else {
      discountAmount = parseFloat(discVal.toFixed(2));
    }
    // Prevent discount from exceeding subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const total = parseFloat((subtotal + taxAmount - discountAmount).toFixed(2));

    // Generate unique sequential-style bill number: BILL-YYYYMMDD-HHMMSS-RAND
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const billNumber = `BILL-${dateStr}-${timeStr}-${randSuffix}`;

    // Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (bill_number, table_number, customer_name, customer_phone, subtotal, tax_rate, tax_amount, 
        discount_type, discount_value, discount_amount, total, payment_method, payment_status, 
        order_status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        parseInt(table_number, 10) || 1,
        customer_name.trim() || 'Walk-in Customer',
        customer_phone.trim(),
        subtotal,
        taxRate,
        taxAmount,
        discount_type,
        discVal,
        discountAmount,
        total,
        payment_method,
        'Paid',
        'Completed',
        notes.trim(),
        req.user.id
      ]
    );

    const orderId = orderResult.insertId;

    // Insert line items
    for (const vItem of verifiedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, vItem.menu_item_id, vItem.item_name, vItem.price, vItem.quantity, vItem.subtotal]
      );
    }

    await connection.commit();

    // Audit log
    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CREATE_BILL',
      details: `Generated Bill #${billNumber} | Table ${table_number} | Total: ₹${total.toFixed(2)} | Method: ${payment_method}`
    });

    res.status(201).json({
      success: true,
      message: `Bill #${billNumber} generated successfully!`,
      order: {
        id: orderId,
        bill_number: billNumber,
        table_number,
        customer_name,
        customer_phone,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_type,
        discount_value: discVal,
        discount_amount: discountAmount,
        total,
        payment_method,
        created_at: now,
        created_by_username: req.user.username,
        items: verifiedItems
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// GET /api/orders - List all orders (Bill History)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { search, payment_method, date, limit = 50 } = req.query;
    let query = `
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
             o.subtotal, o.tax_amount, o.discount_amount, o.total, o.payment_method,
             o.payment_status, o.order_status, o.created_at,
             u.username AS cashier_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (o.bill_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (payment_method) {
      query += ` AND o.payment_method = ?`;
      params.push(payment_method);
    }

    if (date) {
      query += ` AND DATE(o.created_at) = ?`;
      params.push(date);
    }

    query += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [orders] = await db.query(query, params);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get single order with line items (for viewing/reprinting)
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT o.*, u.username AS cashier_username, u.full_name AS cashier_full_name
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = ? OR o.bill_number = ?`,
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    const [items] = await db.query(
      `SELECT oi.id, oi.menu_item_id, oi.item_name, oi.price, oi.quantity, oi.subtotal,
              m.image_url, c.name AS category_name
       FROM order_items oi
       LEFT JOIN menu_items m ON oi.menu_item_id = m.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE oi.order_id = ?
       ORDER BY oi.id ASC`,
      [order.id]
    );

    order.items = items;

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
