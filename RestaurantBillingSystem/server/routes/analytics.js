const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Owner & Admin Analytics Dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('Owner', 'Admin'), async (req, res, next) => {
  try {
    // 1. Overall Revenue & Total Orders
    const [overallStats] = await db.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS total_revenue,
        COUNT(id) AS total_orders,
        COALESCE(AVG(total), 0) AS average_order_value
      FROM orders
    `);

    // 2. Today's Revenue & Orders
    const [todayStats] = await db.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS today_revenue,
        COUNT(id) AS today_orders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);

    // 3. Top 5 Selling Items
    const [topItems] = await db.query(`
      SELECT 
        item_name,
        SUM(quantity) AS total_quantity_sold,
        SUM(subtotal) AS total_revenue
      FROM order_items
      GROUP BY item_name
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

    // 4. Sales by Payment Method
    const [paymentStats] = await db.query(`
      SELECT 
        payment_method,
        COUNT(id) AS count,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      GROUP BY payment_method
    `);

    // 5. Last 7 Days Revenue Trend
    const [weeklyTrend] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(id) AS orders_count,
        COALESCE(SUM(total), 0) AS daily_revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 6. Recent 5 Orders
    const [recentOrders] = await db.query(`
      SELECT o.id, o.bill_number, o.customer_name, o.table_number, o.total, o.payment_method, o.created_at,
             u.username AS cashier_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(overallStats[0].total_revenue),
        totalOrders: parseInt(overallStats[0].total_orders, 10),
        avgOrderValue: parseFloat(overallStats[0].average_order_value),
        todayRevenue: parseFloat(todayStats[0].today_revenue),
        todayOrders: parseInt(todayStats[0].today_orders, 10)
      },
      topItems,
      paymentBreakdown: paymentStats,
      weeklyTrend,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
