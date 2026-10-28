const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/menu/categories - Get all categories
router.get('/categories', async (req, res, next) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/menu - Get all menu items with optional category and search filters
router.get('/', async (req, res, next) => {
  try {
    const { category, search, availableOnly } = req.query;
    let query = `
      SELECT m.id, m.name, m.description, m.price, m.available, m.image_url, 
             c.id AS category_id, c.name AS category_name, m.created_at, m.updated_at
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND (c.name = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (search) {
      query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (availableOnly === 'true') {
      query += ` AND m.available = 1`;
    }

    query += ` ORDER BY c.name ASC, m.name ASC`;

    const [items] = await db.query(query, params);
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
});

// POST /api/menu - Add new menu item (Admin & Owner)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { name, category_id, price, description = '', available = 1, image_url = '' } = req.body;

    // Input Validation (TQM Q01 Reliability)
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid number greater than 0.' });
    }

    const [result] = await db.query(
      `INSERT INTO menu_items (category_id, name, description, price, available, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, name.trim(), description, numPrice, available ? 1 : 0, image_url]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADD_MENU_ITEM',
      details: `Added menu item "${name.trim()}" (₹${numPrice.toFixed(2)})`
    });

    res.status(201).json({
      success: true,
      message: `Menu item "${name.trim()}" added successfully.`,
      itemId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/menu/:id - Edit menu item (Admin & Owner)
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, description, available, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0.' });
    }

    const [check] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await db.query(
      `UPDATE menu_items 
       SET category_id = ?, name = ?, description = ?, price = ?, available = ?, image_url = ?
       WHERE id = ?`,
      [category_id, name.trim(), description || '', numPrice, available ? 1 : 0, image_url || '', id]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_MENU_ITEM',
      details: `Updated item #${id}: "${name.trim()}" | Price: ₹${numPrice.toFixed(2)} | Available: ${available ? 'Yes' : 'No'}`
    });

    res.json({
      success: true,
      message: `Menu item "${name.trim()}" updated successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/menu/:id/toggle - Toggle availability (Cashier, Admin, Owner)
router.patch('/:id/toggle', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [items] = await db.query('SELECT id, name, available FROM menu_items WHERE id = ?', [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const newStatus = items[0].available ? 0 : 1;
    await db.query('UPDATE menu_items SET available = ? WHERE id = ?', [newStatus, id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'TOGGLE_AVAILABILITY',
      details: `Set availability of "${items[0].name}" to ${newStatus ? 'Available' : 'Unavailable'}`
    });

    res.json({
      success: true,
      message: `"${items[0].name}" is now ${newStatus ? 'Available' : 'Unavailable'}.`,
      available: newStatus
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/menu/:id - Delete menu item (Admin & Owner)
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [items] = await db.query('SELECT name FROM menu_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_MENU_ITEM',
      details: `Deleted menu item "${items[0].name}" (ID #${id})`
    });

    res.json({
      success: true,
      message: `Menu item "${items[0].name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
