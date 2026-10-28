const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All kitchen routes are restricted to Kitchen Staff and Administrator
router.use(authenticateToken, authorizeRoles('Kitchen Staff', 'Admin'));

// Allowed kitchen status transitions
const ALLOWED_TRANSITIONS = {
  'New': ['Preparing'],
  'Preparing': ['Ready'],
  'Ready': ['Completed'],
  'Completed': [] // Terminal state for normal workflow
};

// ============================================================
// 1. KITCHEN OVERVIEW METRICS (Section 5.2.A)
// Live summary counts, urgent tickets, elapsed cooking timers
// ============================================================
router.get('/overview', async (req, res, next) => {
  try {
    // 1. Count New Orders
    const [[newStats]] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM orders 
      WHERE order_status = 'Completed' AND kitchen_status = 'New'
    `);

    // 2. Count Preparing Orders
    const [[prepStats]] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM orders 
      WHERE order_status = 'Completed' AND kitchen_status = 'Preparing'
    `);

    // 3. Count Ready Orders (Awaiting Waiter / Collection)
    const [[readyStats]] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM orders 
      WHERE order_status = 'Completed' AND kitchen_status = 'Ready'
    `);

    // 4. Count Completed Orders Today
    const [[completedStats]] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM orders 
      WHERE kitchen_status = 'Completed' 
        AND DATE(kitchen_updated_at) = CURDATE()
    `);

    // 5. Active tickets requiring kitchen attention (ordered oldest first for priority)
    // EXCLUDES ALL FINANCIAL DATA (Section 5.2.F)
    const [attentionOrders] = await db.query(`
      SELECT 
        o.id, 
        o.bill_number, 
        o.table_number, 
        o.kitchen_status, 
        o.notes, 
        o.created_at, 
        o.kitchen_updated_at,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) AS elapsed_minutes
      FROM orders o
      WHERE o.order_status = 'Completed' 
        AND o.kitchen_status IN ('New', 'Preparing', 'Ready')
      ORDER BY o.created_at ASC
      LIMIT 20
    `);

    // Attach food line items (ONLY item_name and quantity)
    for (const ord of attentionOrders) {
      const [items] = await db.query(
        'SELECT item_name, quantity FROM order_items WHERE order_id = ? ORDER BY id ASC',
        [ord.id]
      );
      ord.items = items;
    }

    res.json({
      success: true,
      data: {
        newOrdersCount: newStats.count,
        preparingOrdersCount: prepStats.count,
        readyOrdersCount: readyStats.count,
        completedTodayCount: completedStats.count,
        attentionOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 2. KITCHEN ORDERS FEED (Sections 5.2.B, C, D, E)
// Filter by status ('New', 'Preparing', 'Ready', 'Completed', or 'active')
// ============================================================
router.get('/orders', async (req, res, next) => {
  try {
    const { status = 'active', search = '', date = '', limit = 50 } = req.query;

    let query = `
      SELECT 
        o.id, 
        o.bill_number, 
        o.table_number, 
        o.customer_name,
        o.kitchen_status, 
        o.notes, 
        o.created_at, 
        o.kitchen_updated_at,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) AS elapsed_minutes
      FROM orders o
      WHERE o.order_status = 'Completed'
    `;
    const params = [];

    // Status filter
    if (status === 'active') {
      query += ` AND o.kitchen_status IN ('New', 'Preparing', 'Ready')`;
    } else if (['New', 'Preparing', 'Ready', 'Completed'].includes(status)) {
      query += ` AND o.kitchen_status = ?`;
      params.push(status);
    }

    // Search filter (Bill # or Table #)
    if (search.trim()) {
      query += ` AND (o.bill_number LIKE ? OR o.table_number LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Date filter (useful for completed history)
    if (date) {
      query += ` AND DATE(o.created_at) = ?`;
      params.push(date);
    }

    // Sorting: New & preparing orders show oldest first (FIFO); Completed shows newest first
    if (status === 'Completed') {
      query += ` ORDER BY o.kitchen_updated_at DESC LIMIT ?`;
    } else {
      query += ` ORDER BY o.created_at ASC LIMIT ?`;
    }
    params.push(parseInt(limit, 10));

    const [orders] = await db.query(query, params);

    // Attach items without prices or financial totals
    for (const ord of orders) {
      const [items] = await db.query(
        'SELECT id, item_name, quantity FROM order_items WHERE order_id = ? ORDER BY id ASC',
        [ord.id]
      );
      ord.items = items;
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

// ============================================================
// 3. UPDATE PREPARATION STATUS (Sections 5.2.B, C, D)
// Validated transitions: New -> Preparing -> Ready -> Completed
// ============================================================
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_status } = req.body;

    if (!new_status || !['Preparing', 'Ready', 'Completed'].includes(new_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status target. Must be one of ["Preparing", "Ready", "Completed"].'
      });
    }

    // Fetch existing order
    const [orders] = await db.query(
      'SELECT id, bill_number, table_number, kitchen_status FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order ticket not found.' });
    }

    const order = orders[0];
    const currentStatus = order.kitchen_status;

    // Check permitted transition rules
    const allowedTargets = ALLOWED_TRANSITIONS[currentStatus] || [];
    const isAdmin = req.user.role === 'Admin';

    if (!allowedTargets.includes(new_status) && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Unauthorized status transition: Cannot change an order from "${currentStatus}" to "${new_status}".`
      });
    }

    // Update status and timestamp in database
    await db.query(
      'UPDATE orders SET kitchen_status = ?, kitchen_updated_at = NOW() WHERE id = ?',
      [new_status, id]
    );

    // Audit log
    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'KITCHEN_STATUS_UPDATE',
      details: `Kitchen ticket #${order.bill_number} (Table ${order.table_number}) transitioned from [${currentStatus}] to [${new_status}] by ${req.user.username}`
    });

    res.json({
      success: true,
      message: `Order #${order.bill_number} is now marked as "${new_status}".`,
      order: {
        id: order.id,
        bill_number: order.bill_number,
        table_number: order.table_number,
        previous_status: currentStatus,
        kitchen_status: new_status,
        kitchen_updated_at: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 4. GET SINGLE ORDER PREPARATION TICKET (Section 5.2.F)
// Returns food prep details strictly sanitized of financial data
// ============================================================
router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT 
        o.id, 
        o.bill_number, 
        o.table_number, 
        o.customer_name, 
        o.kitchen_status, 
        o.notes, 
        o.created_at, 
        o.kitchen_updated_at,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) AS elapsed_minutes
      FROM orders o
      WHERE o.id = ? OR o.bill_number = ?`,
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    const [items] = await db.query(
      `SELECT oi.id, oi.item_name, oi.quantity, m.description, c.name AS category_name
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