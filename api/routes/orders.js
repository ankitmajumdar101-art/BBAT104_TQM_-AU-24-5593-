const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Helper to fetch current billing settings from DB
async function getBillingSettings() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
  const settings = {
    tax_rate_cgst: 2.50,
    tax_rate_sgst: 2.50,
    max_discount_percent: 25.00,
    billing_rounding: 'exact',
    receipt_prefix: 'BILL',
    currency_symbol: '₹',
    restaurant_name: 'Royal Feast Restaurant',
    address: '101 Commercial Boulevard, City Center',
    phone: '+91 98765 43210',
    gstin: '27AABCR1234F1Z8',
    receipt_header: 'ROYAL FEAST RESTAURANT',
    receipt_footer: 'Thank you for dining with us! Please visit again.'
  };

  rows.forEach(r => {
    if (r.setting_key === 'tax_rate_cgst') settings.tax_rate_cgst = parseFloat(r.setting_value) || 2.50;
    if (r.setting_key === 'tax_rate_sgst') settings.tax_rate_sgst = parseFloat(r.setting_value) || 2.50;
    if (r.setting_key === 'max_discount_percent') settings.max_discount_percent = parseFloat(r.setting_value) || 25.00;
    if (r.setting_key === 'billing_rounding') settings.billing_rounding = r.setting_value;
    if (r.setting_key === 'receipt_prefix') settings.receipt_prefix = r.setting_value || 'BILL';
    if (r.setting_key === 'currency_symbol') settings.currency_symbol = r.setting_value || '₹';
    if (r.setting_key === 'restaurant_name') settings.restaurant_name = r.setting_value;
    if (r.setting_key === 'address') settings.address = r.setting_value;
    if (r.setting_key === 'phone') settings.phone = r.setting_value;
    if (r.setting_key === 'gstin') settings.gstin = r.setting_value;
    if (r.setting_key === 'receipt_header') settings.receipt_header = r.setting_value;
    if (r.setting_key === 'receipt_footer') settings.receipt_footer = r.setting_value;
  });

  settings.total_tax_rate = parseFloat((settings.tax_rate_cgst + settings.tax_rate_sgst).toFixed(2));
  return settings;
}

// ============================================================
// 1. CASHIER OVERVIEW METRICS (Section 4.2.A)
// Strictly isolated to the logged-in cashier's own transactions
// ============================================================
router.get('/cashier/overview', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const cashierId = req.user.id;

    // Today's completed bills and sales for this cashier
    const [todayStats] = await db.query(`
      SELECT 
        COUNT(*) AS today_bills_count,
        COALESCE(SUM(total), 0) AS today_sales_total
      FROM orders
      WHERE created_by = ? 
        AND DATE(created_at) = CURDATE() 
        AND order_status = 'Completed'
    `, [cashierId]);

    // Active draft bills for this cashier
    const [draftStats] = await db.query(`
      SELECT COUNT(*) AS draft_count
      FROM orders
      WHERE created_by = ? AND order_status = 'Draft'
    `, [cashierId]);

    // Active pending kitchen orders for this cashier
    const [pendingStats] = await db.query(`
      SELECT COUNT(*) AS pending_orders_count
      FROM orders
      WHERE created_by = ? 
        AND order_status = 'Completed' 
        AND kitchen_status IN ('New', 'Preparing')
    `, [cashierId]);

    // Refund requested orders count
    const [refundStats] = await db.query(`
      SELECT COUNT(*) AS refund_requests_count
      FROM orders
      WHERE created_by = ? AND refund_status = 'Pending'
    `, [cashierId]);

    // Recent 10 bills created by this cashier
    const [recentBills] = await db.query(`
      SELECT id, bill_number, table_number, customer_name, total, 
             payment_method, payment_status, order_status, kitchen_status, refund_status, created_at
      FROM orders
      WHERE created_by = ?
      ORDER BY id DESC LIMIT 10
    `, [cashierId]);

    res.json({
      success: true,
      data: {
        todayBillsCount: todayStats[0].today_bills_count,
        todaySalesTotal: parseFloat(todayStats[0].today_sales_total || 0),
        draftCount: draftStats[0].draft_count,
        pendingOrdersCount: pendingStats[0].pending_orders_count,
        refundRequestsCount: refundStats[0].refund_requests_count,
        recentBills
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 2. CASHIER MY BILL HISTORY (Section 4.2.G)
// Isolated to the logged-in Cashier (Admin sees all)
// ============================================================
router.get('/my-history', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const { search, payment_method, date, status, limit = 100 } = req.query;
    const isCashier = req.user.role === 'Cashier';

    let query = `
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
             o.subtotal, o.tax_rate, o.tax_amount, o.discount_type, o.discount_value, o.discount_amount,
             o.total, o.payment_method, o.payment_status, o.order_status, o.kitchen_status,
             o.amount_received, o.change_due, o.transaction_reference,
             o.refund_status, o.refund_reason, o.refund_requested_at, o.refund_decided_at,
             o.notes, o.created_at,
             u.username AS cashier_username, u.full_name AS cashier_full_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Cashiers only see their own bills
    if (isCashier) {
      query += ` AND o.created_by = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (o.bill_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (payment_method && payment_method !== 'All') {
      query += ` AND o.payment_method = ?`;
      params.push(payment_method);
    }

    if (date) {
      query += ` AND DATE(o.created_at) = ?`;
      params.push(date);
    }

    if (status && status !== 'All') {
      if (status === 'Draft' || status === 'Completed' || status === 'Cancelled' || status === 'Voided') {
        query += ` AND o.order_status = ?`;
        params.push(status);
      } else if (status === 'Refund Pending') {
        query += ` AND o.refund_status = 'Pending'`;
      } else if (status === 'Refunded') {
        query += ` AND (o.order_status = 'Refunded' OR o.refund_status = 'Approved')`;
      }
    }

    query += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [orders] = await db.query(query, params);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 3. DRAFT BILLS MANAGEMENT (Section 4.2.C)
// Save unfinalized orders and resume or discard them
// ============================================================
router.get('/drafts', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const [drafts] = await db.query(`
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
             o.subtotal, o.total, o.notes, o.created_at,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      WHERE o.created_by = ? AND o.order_status = 'Draft'
      ORDER BY o.id DESC
    `, [req.user.id]);

    res.json({ success: true, drafts });
  } catch (error) {
    next(error);
  }
});

router.post('/draft', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      table_number = 1,
      customer_name = 'Walk-in Guest',
      customer_phone = '',
      items = [],
      notes = ''
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot save an empty draft. Please add at least one item.' });
    }

    await connection.beginTransaction();

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) continue;

      const [menuRows] = await connection.query(
        'SELECT id, name, price FROM menu_items WHERE id = ?',
        [item.id || item.menu_item_id]
      );

      if (menuRows.length > 0) {
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
    }

    if (verifiedItems.length === 0) {
      throw new Error('No valid items found to save in draft.');
    }

    const settings = await getBillingSettings();
    const taxAmount = parseFloat(((subtotal * settings.total_tax_rate) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    const draftNumber = `DRAFT-${Date.now().toString().slice(-6)}-T${table_number}`;

    const [orderResult] = await connection.query(`
      INSERT INTO orders 
       (bill_number, table_number, customer_name, customer_phone, subtotal, tax_rate, tax_amount, 
        discount_type, discount_value, discount_amount, total, payment_method, payment_status, 
        order_status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'fixed', 0, 0, ?, 'Unpaid', 'Unpaid', 'Draft', ?, ?)
    `, [
      draftNumber,
      parseInt(table_number, 10) || 1,
      customer_name.trim() || 'Walk-in Guest',
      customer_phone.trim(),
      subtotal,
      settings.total_tax_rate,
      taxAmount,
      total,
      (notes || '').trim(),
      req.user.id
    ]);

    const orderId = orderResult.insertId;

    for (const vItem of verifiedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, vItem.menu_item_id, vItem.item_name, vItem.price, vItem.quantity, vItem.subtotal]
      );
    }

    await connection.commit();

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'SAVE_DRAFT_BILL',
      details: `Saved Draft Bill #${draftNumber} (Table ${table_number}, ${verifiedItems.length} items)`
    });

    res.status(201).json({
      success: true,
      message: `Draft #${draftNumber} saved successfully.`,
      draftId: orderId,
      bill_number: draftNumber
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.delete('/drafts/:id', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM orders WHERE id = ? AND created_by = ? AND order_status = "Draft"',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Draft bill not found or already finalized.' });
    }

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DISCARD_DRAFT_BILL',
      details: `Discarded draft order ID ${id}`
    });

    res.json({ success: true, message: 'Draft bill discarded successfully.' });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 4. KITCHEN ORDER TRACKING FOR CASHIER (Section 4.2.H)
// Live status updates of orders placed by this cashier
// ============================================================
router.get('/kitchen-status', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const isCashier = req.user.role === 'Cashier';
    let query = `
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.order_status, 
             o.kitchen_status, o.total, o.created_at,
             u.username AS cashier_username
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.order_status = 'Completed'
    `;
    const params = [];

    if (isCashier) {
      query += ` AND o.created_by = ?`;
      params.push(req.user.id);
    }

    query += ` ORDER BY o.id DESC LIMIT 30`;

    const [orders] = await db.query(query, params);

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT item_name, quantity FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 5. REFUND & VOID REQUESTS (Section 4.2.I)
// Cashier submits request with mandatory reason; Admin/Owner approves
// ============================================================
router.post('/:id/request-refund-void', authenticateToken, authorizeRoles('Cashier', 'Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { request_type = 'Refund', reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory reason must be provided for refund or void requests.'
      });
    }

    // Cashier can only request on their own orders
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    if (req.user.role === 'Cashier' && order.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only request refunds on your own bills.' });
    }

    if (order.order_status === 'Refunded' || order.order_status === 'Voided') {
      return res.status(400).json({ success: false, message: `This bill has already been ${order.order_status.toLowerCase()}.` });
    }

    if (order.refund_status === 'Pending') {
      return res.status(400).json({ success: false, message: 'A refund or void request is already pending review for this bill.' });
    }

    const fullReason = `[${request_type}] ${reason.trim()} (Requested by ${req.user.username})`;

    await db.query(`
      UPDATE orders 
      SET refund_status = 'Pending',
          refund_reason = ?,
          refund_requested_at = NOW()
      WHERE id = ?
    `, [fullReason, id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'REQUEST_REFUND_OR_VOID',
      details: `${request_type} requested for Bill #${order.bill_number}. Reason: ${reason.trim()}`
    });

    res.json({
      success: true,
      message: `${request_type} request submitted successfully and forwarded to Administrator / Owner for review.`
    });
  } catch (error) {
    next(error);
  }
});

// Admin / Owner decides refund (Approve / Reject)
router.put('/:id/decide-refund', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, notes = '' } = req.body; // 'Approve' or 'Reject'

    if (!['Approve', 'Reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be either "Approve" or "Reject".' });
    }

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    const isApproved = decision === 'Approve';
    const isVoid = (order.refund_reason || '').includes('[Void]');
    const newOrderStatus = isApproved ? (isVoid ? 'Voided' : 'Refunded') : order.order_status;
    const newRefundStatus = isApproved ? 'Approved' : 'Rejected';

    await db.query(`
      UPDATE orders 
      SET refund_status = ?,
          order_status = ?,
          refund_decided_at = NOW()
      WHERE id = ?
    `, [newRefundStatus, newOrderStatus, id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: isApproved ? 'APPROVE_REFUND_OR_VOID' : 'REJECT_REFUND_OR_VOID',
      details: `${decision}ed refund/void request for Bill #${order.bill_number}. Decided by ${req.user.username}. Notes: ${notes}`
    });

    res.json({
      success: true,
      message: `Refund/Void request for Bill #${order.bill_number} has been ${decision.toLowerCase()}d.`
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 6. CREATE FINALIZED BILL (Sections 4.2.C, D, E)
// Server-side authoritative recalculation, discount limits, cash/UPI validation
// ============================================================
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
      amount_received = 0,
      transaction_reference = '',
      notes = '',
      draft_id = null
    } = req.body;

    // Input Validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate an empty bill. Please add at least one item.'
      });
    }

    // Load server-side billing rules
    const settings = await getBillingSettings();

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
        throw new Error(`Menu item with ID ${item.id || item.menu_item_id} does not exist.`);
      }

      const menuItem = menuRows[0];
      if (!menuItem.available) {
        throw new Error(`Menu item "${menuItem.name}" is currently marked unavailable by kitchen/management.`);
      }

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

    // Authoritative Tax calculation: CGST + SGST
    const taxRate = settings.total_tax_rate;
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));

    // Validate and calculate discount
    let discountAmount = 0;
    const discVal = parseFloat(discount_value) || 0;
    const maxDiscountPercent = settings.max_discount_percent;

    if (discount_type === 'percentage') {
      if (discVal > maxDiscountPercent) {
        throw new Error(`Discount of ${discVal}% exceeds maximum allowed limit of ${maxDiscountPercent}%.`);
      }
      discountAmount = parseFloat(((subtotal * discVal) / 100).toFixed(2));
    } else {
      // Fixed discount cannot exceed equivalent of maxDiscountPercent of subtotal
      const maxAllowedFixed = parseFloat(((subtotal * maxDiscountPercent) / 100).toFixed(2));
      if (discVal > maxAllowedFixed) {
        throw new Error(`Fixed discount ₹${discVal.toFixed(2)} exceeds maximum allowed limit of ₹${maxAllowedFixed.toFixed(2)} (${maxDiscountPercent}%).`);
      }
      discountAmount = parseFloat(discVal.toFixed(2));
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    let total = parseFloat((subtotal + taxAmount - discountAmount).toFixed(2));

    // Rounding configuration (exact or nearest rupee)
    if (settings.billing_rounding === 'nearest_rupee') {
      total = Math.round(total);
    }

    // Payment validation & Change Due
    let amountRec = parseFloat(amount_received) || 0;
    let changeDue = 0;

    if (payment_method === 'Cash') {
      if (amountRec < total) {
        amountRec = total; // Fallback to exact if not provided
      }
      changeDue = parseFloat((amountRec - total).toFixed(2));
    } else {
      amountRec = total;
      changeDue = 0;
    }

    // Card security safeguard: do not allow raw credit card numbers
    let sanitizedRef = (transaction_reference || '').trim();
    if (payment_method === 'Card' && /^\d{13,19}$/.test(sanitizedRef)) {
      sanitizedRef = `Card ending in ${sanitizedRef.slice(-4)}`;
    }

    // Generate unique sequential-style bill number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const billNumber = `${settings.receipt_prefix}-${dateStr}-${timeStr}-${randSuffix}`;

    // Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (bill_number, table_number, customer_name, customer_phone, subtotal, tax_rate, tax_amount, 
        discount_type, discount_value, discount_amount, total, payment_method, payment_status, 
        order_status, kitchen_status, amount_received, change_due, transaction_reference, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, ?, ?, ?)`,
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
        amountRec,
        changeDue,
        sanitizedRef,
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

    // If converted from a draft, remove the draft bill
    if (draft_id) {
      await connection.query('DELETE FROM orders WHERE id = ? AND created_by = ? AND order_status = "Draft"', [draft_id, req.user.id]);
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
      message: `Bill #${billNumber} finalized successfully!`,
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
        amount_received: amountRec,
        change_due: changeDue,
        transaction_reference: sanitizedRef,
        order_status: 'Completed',
        kitchen_status: 'New',
        created_at: now,
        created_by_username: req.user.username,
        items: verifiedItems,
        settings: {
          restaurant_name: settings.restaurant_name,
          address: settings.address,
          phone: settings.phone,
          gstin: settings.gstin,
          receipt_header: settings.receipt_header,
          receipt_footer: settings.receipt_footer,
          tax_rate_cgst: settings.tax_rate_cgst,
          tax_rate_sgst: settings.tax_rate_sgst
        }
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
// 7. GET ALL ORDERS (System-wide for Admin / Owner)
// ============================================================
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { search, payment_method, date, limit = 50 } = req.query;
    let query = `
      SELECT o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
             o.subtotal, o.tax_amount, o.discount_amount, o.total, o.payment_method,
             o.payment_status, o.order_status, o.kitchen_status, o.refund_status, o.created_at,
             u.username AS cashier_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // If Cashier calls this general endpoint, automatically constrain to their own bills
    if (req.user.role === 'Cashier') {
      query += ` AND o.created_by = ?`;
      params.push(req.user.id);
    }

    if (search) {
      query += ` AND (o.bill_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (payment_method && payment_method !== 'All') {
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

// ============================================================
// 8. GET SINGLE ORDER WITH LINE ITEMS & SETTINGS
// For Receipt Generation & Duplicate Reprinting (Section 4.2.F & G)
// ============================================================
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

    // If Cashier, ensure they cannot view other cashiers' bills
    if (req.user.role === 'Cashier' && order.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own bills.' });
    }

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

    // Attach business branding & tax breakdown for receipt printing
    const settings = await getBillingSettings();
    order.settings = {
      restaurant_name: settings.restaurant_name,
      address: settings.address,
      phone: settings.phone,
      gstin: settings.gstin,
      receipt_header: settings.receipt_header,
      receipt_footer: settings.receipt_footer,
      tax_rate_cgst: settings.tax_rate_cgst,
      tax_rate_sgst: settings.tax_rate_sgst
    };

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;