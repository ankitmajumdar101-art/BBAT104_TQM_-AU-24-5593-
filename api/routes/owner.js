const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes in this file strictly require the Owner role
router.use(authenticateToken, authorizeRoles('Owner'));

// ============================================================
// A. OVERVIEW DASHBOARD (Section 2.2.A)
// ============================================================
router.get('/overview', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. Today's Completed Sales & Count
    const [todayCompleted] = await db.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS total_sales,
        COUNT(id) AS completed_bills,
        COALESCE(AVG(total), 0) AS avg_bill_amount
      FROM orders
      WHERE DATE(created_at) = CURDATE()
        AND order_status = 'Completed'
    `);

    // 2. Today's Cancelled / Voided Bills
    const [todayCancelled] = await db.query(`
      SELECT COUNT(id) AS cancelled_bills
      FROM orders
      WHERE DATE(created_at) = CURDATE()
        AND order_status IN ('Cancelled', 'Voided')
    `);

    // 3. Current Month Sales
    const [monthSales] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS month_sales, COUNT(id) AS month_bills
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
        AND order_status = 'Completed'
    `);

    // 4. Yesterday's Sales (for comparison)
    const [yesterdaySales] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS yesterday_sales
      FROM orders
      WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND order_status = 'Completed'
    `);

    // 5. Last Month Sales (for comparison)
    const [lastMonthSales] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS last_month_sales
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        AND created_at < DATE_SUB(CURDATE(), INTERVAL 0 MONTH)
        AND order_status = 'Completed'
    `);

    // 6. Custom Date Range Sales (if specified)
    let customRangeData = null;
    if (startDate && endDate) {
      const [customRes] = await db.query(`
        SELECT 
          COALESCE(SUM(total), 0) AS range_sales,
          COUNT(id) AS range_bills,
          COALESCE(AVG(total), 0) AS range_avg
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND order_status = 'Completed'
      `, [startDate, endDate]);
      customRangeData = customRes[0];
    }

    // 7. Today's & Month's Recorded Expenses
    const [todayExp] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS today_expenses
      FROM expenses
      WHERE expense_date = CURDATE()
    `);

    const [monthExp] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS month_expenses
      FROM expenses
      WHERE MONTH(expense_date) = MONTH(CURDATE()) 
        AND YEAR(expense_date) = YEAR(CURDATE())
    `);

    // 8. Payment Totals by Payment Method
    const [paymentBreakdown] = await db.query(`
      SELECT 
        payment_method,
        COUNT(id) AS count,
        COALESCE(SUM(total), 0) AS total_amount
      FROM orders
      WHERE order_status = 'Completed'
      GROUP BY payment_method
    `);

    // 9. Recent Sales Activity (Last 6 orders)
    const [recentActivity] = await db.query(`
      SELECT 
        o.id, o.bill_number, o.customer_name, o.table_number, o.total,
        o.payment_method, o.order_status, o.created_at,
        u.username AS cashier_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      ORDER BY o.id DESC
      LIMIT 6
    `);

    // Calculations
    const todaySales = parseFloat(todayCompleted[0].total_sales);
    const yesterdaySalesNum = parseFloat(yesterdaySales[0].yesterday_sales);
    const dayGrowth = yesterdaySalesNum > 0 
      ? (((todaySales - yesterdaySalesNum) / yesterdaySalesNum) * 100).toFixed(1)
      : todaySales > 0 ? 100 : 0;

    const currentMonthSalesNum = parseFloat(monthSales[0].month_sales);
    const monthExpensesNum = parseFloat(monthExp[0].month_expenses);
    const estimatedMonthProfit = currentMonthSalesNum - monthExpensesNum;

    res.json({
      success: true,
      overview: {
        today: {
          totalSales: todaySales,
          completedBills: parseInt(todayCompleted[0].completed_bills, 10),
          cancelledBills: parseInt(todayCancelled[0].cancelled_bills, 10),
          avgBillAmount: parseFloat(todayCompleted[0].avg_bill_amount),
          expenses: parseFloat(todayExp[0].today_expenses),
          growthVsYesterday: parseFloat(dayGrowth)
        },
        month: {
          totalSales: currentMonthSalesNum,
          totalBills: parseInt(monthSales[0].month_bills, 10),
          expenses: monthExpensesNum,
          estimatedProfit: estimatedMonthProfit
        },
        customRange: customRangeData,
        paymentBreakdown,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// B. SALES REPORTS (Section 2.2.B)
// ============================================================
router.get('/sales-reports', async (req, res, next) => {
  try {
    const { period = 'daily', startDate, endDate, paymentMethod } = req.query;

    let dateCondition = `1=1`;
    const params = [];

    if (startDate && endDate) {
      dateCondition = `DATE(o.created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else {
      switch (period) {
        case 'weekly':
          dateCondition = `o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
          break;
        case 'monthly':
          dateCondition = `o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
          break;
        case 'yearly':
          dateCondition = `o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
          break;
        case 'daily':
        default:
          dateCondition = `DATE(o.created_at) = CURDATE()`;
          break;
      }
    }

    if (paymentMethod) {
      dateCondition += ` AND o.payment_method = ?`;
      params.push(paymentMethod);
    }

    // Aggregates for completed sales
    const [completedSummary] = await db.query(`
      SELECT 
        COUNT(id) AS total_bills,
        COALESCE(SUM(subtotal), 0) AS gross_sales,
        COALESCE(SUM(discount_amount), 0) AS total_discounts,
        COALESCE(SUM(tax_amount), 0) AS total_taxes,
        COALESCE(SUM(total), 0) AS net_sales
      FROM orders o
      WHERE ${dateCondition} AND o.order_status = 'Completed'
    `, params);

    // Cancelled / Refunded summary
    const [cancelledSummary] = await db.query(`
      SELECT 
        COUNT(id) AS cancelled_count,
        COALESCE(SUM(total), 0) AS cancelled_amount
      FROM orders o
      WHERE ${dateCondition} AND o.order_status IN ('Cancelled', 'Voided')
    `, params);

    // Timeline breakdown (by date)
    const [timelineData] = await db.query(`
      SELECT 
        DATE(o.created_at) AS report_date,
        COUNT(o.id) AS orders_count,
        COALESCE(SUM(o.subtotal), 0) AS gross_sales,
        COALESCE(SUM(o.discount_amount), 0) AS discounts,
        COALESCE(SUM(o.tax_amount), 0) AS taxes,
        COALESCE(SUM(o.total), 0) AS net_sales
      FROM orders o
      WHERE ${dateCondition} AND o.order_status = 'Completed'
      GROUP BY DATE(o.created_at)
      ORDER BY report_date ASC
    `, params);

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      filter: { period, startDate, endDate, paymentMethod },
      summary: {
        totalCompletedBills: parseInt(completedSummary[0].total_bills, 10),
        grossSales: parseFloat(completedSummary[0].gross_sales),
        discounts: parseFloat(completedSummary[0].total_discounts),
        taxes: parseFloat(completedSummary[0].total_taxes),
        netSales: parseFloat(completedSummary[0].net_sales),
        cancelledBillsCount: parseInt(cancelledSummary[0].cancelled_count, 10),
        cancelledAmount: parseFloat(cancelledSummary[0].cancelled_amount)
      },
      timeline: timelineData
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// C. REVENUE AND EXPENSES (Section 2.2.C)
// ============================================================
router.get('/expenses', async (req, res, next) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = `
      SELECT e.id, e.category, e.amount, e.description, e.expense_date, e.created_at,
             u.username AS recorded_by_username, u.full_name AS recorded_by_name
      FROM expenses e
      LEFT JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += ` AND e.expense_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (category) {
      query += ` AND e.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY e.expense_date DESC, e.id DESC`;

    const [expenses] = await db.query(query, params);

    // Grouping totals by category
    const [categorySummary] = await db.query(`
      SELECT category, COUNT(id) AS count, COALESCE(SUM(amount), 0) AS total_amount
      FROM expenses
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    // Total expense amount
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({
      success: true,
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      categorySummary,
      expenses
    });
  } catch (error) {
    next(error);
  }
});

// Add new expense (Owner & Admin permitted)
router.post('/expenses', async (req, res, next) => {
  try {
    const { category, amount, description, expense_date } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Expense category is required.' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    const expDate = expense_date || new Date().toISOString().slice(0, 10);

    const [result] = await db.query(`
      INSERT INTO expenses (category, amount, description, expense_date, recorded_by)
      VALUES (?, ?, ?, ?, ?)
    `, [category.trim(), numAmount, description.trim(), expDate, req.user.id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADD_EXPENSE',
      details: `Added expense ₹${numAmount.toFixed(2)} [${category}]: ${description.trim()}`
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully.',
      expenseId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_EXPENSE',
      details: `Deleted expense record #${id} (₹${existing[0].amount})`
    });

    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// D. PROFIT AND LOSS (Section 2.2.D)
// ============================================================
router.get('/profit-loss', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateSalesCond = '1=1';
    let dateExpCond = '1=1';
    const paramsSales = [];
    const paramsExp = [];

    if (startDate && endDate) {
      dateSalesCond = 'DATE(created_at) BETWEEN ? AND ?';
      dateExpCond = 'expense_date BETWEEN ? AND ?';
      paramsSales.push(startDate, endDate);
      paramsExp.push(startDate, endDate);
    } else {
      // Default: Current Month
      dateSalesCond = 'MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
      dateExpCond = 'MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())';
    }

    // 1. Sales metrics
    const [salesData] = await db.query(`
      SELECT 
        COUNT(id) AS total_bills,
        COALESCE(SUM(subtotal), 0) AS gross_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts,
        COALESCE(SUM(tax_amount), 0) AS taxes,
        COALESCE(SUM(total), 0) AS net_sales
      FROM orders
      WHERE ${dateSalesCond} AND order_status = 'Completed'
    `, paramsSales);

    // 2. Cancelled / refunds
    const [voidedData] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS voided_total
      FROM orders
      WHERE ${dateSalesCond} AND order_status IN ('Cancelled', 'Voided')
    `, paramsSales);

    // 3. Expenses breakdown
    const [expensesBreakdown] = await db.query(`
      SELECT category, COALESCE(SUM(amount), 0) AS category_total
      FROM expenses
      WHERE ${dateExpCond}
      GROUP BY category
    `, paramsExp);

    const [totalExp] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS grand_total_expenses
      FROM expenses
      WHERE ${dateExpCond}
    `, paramsExp);

    const grossSales = parseFloat(salesData[0].gross_sales);
    const discounts = parseFloat(salesData[0].discounts);
    const taxes = parseFloat(salesData[0].taxes);
    const netSales = parseFloat(salesData[0].net_sales);
    const voidedSales = parseFloat(voidedData[0].voided_total);
    const totalExpenses = parseFloat(totalExp[0].grand_total_expenses);

    // Transparent calculation
    const operatingProfit = netSales - totalExpenses;

    res.json({
      success: true,
      dateRange: { startDate: startDate || 'Current Month', endDate: endDate || 'Current Month' },
      revenue: {
        grossSales,
        discounts,
        taxes,
        voidedSales,
        netSales
      },
      expenses: {
        totalExpenses,
        breakdown: expensesBreakdown
      },
      profitability: {
        operatingProfit,
        profitMarginPct: netSales > 0 ? parseFloat(((operatingProfit / netSales) * 100).toFixed(2)) : 0
      },
      calculationRuleNote: 'Operating Profit = Net Sales - Total Recorded Expenses. (Note: Only recorded expenses and finalized sales are included. Indirect depreciation and unrecorded costs are excluded).'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// E. BILL HISTORY (READ-ONLY) (Section 2.2.E)
// ============================================================
router.get('/bills', async (req, res, next) => {
  try {
    const { 
      search, 
      paymentMethod, 
      billStatus, 
      cashierId, 
      date, 
      startDate, 
      endDate, 
      limit = 100 
    } = req.query;

    let query = `
      SELECT 
        o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
        o.subtotal, o.tax_rate, o.tax_amount, o.discount_type, o.discount_value, o.discount_amount,
        o.total, o.payment_method, o.payment_status, o.order_status, o.notes, o.created_at,
        u.id AS cashier_id, u.username AS cashier_username, u.full_name AS cashier_full_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (o.bill_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query += ` AND o.payment_method = ?`;
      params.push(paymentMethod);
    }

    if (billStatus && billStatus !== 'All') {
      query += ` AND o.order_status = ?`;
      params.push(billStatus);
    }

    if (cashierId && cashierId !== 'All') {
      query += ` AND o.created_by = ?`;
      params.push(cashierId);
    }

    if (date) {
      query += ` AND DATE(o.created_at) = ?`;
      params.push(date);
    } else if (startDate && endDate) {
      query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [bills] = await db.query(query, params);

    // List of cashiers for filter dropdown
    const [cashiers] = await db.query(`
      SELECT DISTINCT u.id, u.username, u.full_name
      FROM users u
      JOIN orders o ON o.created_by = u.id
      ORDER BY u.full_name ASC
    `);

    res.json({
      success: true,
      count: bills.length,
      cashiers,
      bills
    });
  } catch (error) {
    next(error);
  }
});

// Single Bill Details with Items (Read-Only)
router.get('/bills/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [bills] = await db.query(`
      SELECT 
        o.id, o.bill_number, o.table_number, o.customer_name, o.customer_phone,
        o.subtotal, o.tax_rate, o.tax_amount, o.discount_type, o.discount_value, o.discount_amount,
        o.total, o.payment_method, o.payment_status, o.order_status, o.notes, o.created_at,
        u.id AS cashier_id, u.username AS cashier_username, u.full_name AS cashier_full_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = ? OR o.bill_number = ?
    `, [id, id]);

    if (bills.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }

    const bill = bills[0];

    const [items] = await db.query(`
      SELECT 
        oi.id, oi.menu_item_id, oi.item_name, oi.price, oi.quantity, oi.subtotal,
        c.name AS category_name
      FROM order_items oi
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `, [bill.id]);

    bill.items = items;

    // Fetch business settings for receipt header/footer
    const [settingsRows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
    const settings = {};
    settingsRows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    res.json({
      success: true,
      bill,
      settings
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// F. STAFF PERFORMANCE REPORTS (Section 2.2.F)
// ============================================================
router.get('/staff-performance', async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;

    let condition = `o.order_status = 'Completed'`;
    const params = [];

    if (startDate && endDate) {
      condition += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (staffId) {
      condition += ` AND o.created_by = ?`;
      params.push(staffId);
    }

    const [staffStats] = await db.query(`
      SELECT 
        u.id AS staff_id,
        u.username,
        u.full_name,
        u.role,
        COUNT(o.id) AS total_bills_handled,
        COALESCE(SUM(o.total), 0) AS total_sales_generated,
        COALESCE(AVG(o.total), 0) AS avg_bill_value
      FROM users u
      LEFT JOIN orders o ON o.created_by = u.id AND ${condition}
      WHERE u.role IN ('Cashier', 'Admin')
      GROUP BY u.id, u.username, u.full_name, u.role
      ORDER BY total_sales_generated DESC
    `, params);

    res.json({
      success: true,
      staffPerformance: staffStats
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// G. BUSINESS SETTINGS (Section 2.2.G)
// ============================================================
router.get('/settings', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM restaurant_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const allowedKeys = [
      'restaurant_name',
      'tagline',
      'address',
      'phone',
      'email',
      'gstin',
      'receipt_header',
      'receipt_footer',
      'currency_symbol'
    ];

    const updates = req.body;
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        await db.query(`
          INSERT INTO restaurant_settings (setting_key, setting_value)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [key, String(updates[key]).trim()]);
      }
    }

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_BUSINESS_SETTINGS',
      details: 'Updated restaurant business profile settings'
    });

    res.json({ success: true, message: 'Business settings updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// H. PROFILE AND PASSWORD (Section 2.2.H)
// ============================================================
router.get('/profile', async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, profile: users[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const { full_name, email, phone } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    await db.query(`
      UPDATE users 
      SET full_name = ?, email = ?, phone = ?
      WHERE id = ?
    `, [full_name.trim(), email ? email.trim() : '', phone ? phone.trim() : '', req.user.id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_PROFILE',
      details: `Owner updated profile details (${req.user.username})`
    });

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const match = await bcrypt.compare(currentPassword, users[0].password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CHANGE_PASSWORD',
      details: `Owner changed password (${req.user.username})`
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
