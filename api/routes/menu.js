const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ============================================================
// CATEGORY MANAGEMENT (Section 3.2.E)
// ============================================================

// GET /api/menu/categories - Get all categories
router.get('/categories', async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    let query = 'SELECT * FROM categories';
    if (includeInactive !== 'true') {
      query += " WHERE status = 'active' OR status IS NULL";
    }
    query += ' ORDER BY name ASC';
    const [categories] = await db.query(query);
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
});

// POST /api/menu/categories - Add category (Admin only)
router.post('/categories', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { name, description = '', status = 'active' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [existing] = await db.query('SELECT id FROM categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description, status) VALUES (?, ?, ?)',
      [name.trim(), description.trim(), status]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADD_CATEGORY',
      details: `Created menu category "${name.trim()}"`
    });

    res.status(201).json({
      success: true,
      message: `Category "${name.trim()}" created successfully.`,
      categoryId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/menu/categories/:id - Update category (Admin only)
router.put('/categories/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await db.query(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
      [
        name !== undefined ? name.trim() : existing[0].name,
        description !== undefined ? description.trim() : existing[0].description,
        status || existing[0].status,
        id
      ]
    );

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'UPDATE_CATEGORY',
      details: `Updated category #${id} ("${name || existing[0].name}")`
    });

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/menu/categories/:id - Deactivate category (Section 3.2.E safeguard)
router.delete('/categories/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if items exist under this category
    const [items] = await db.query('SELECT id FROM menu_items WHERE category_id = ? LIMIT 1', [id]);

    if (items.length > 0) {
      // Historical Safeguard: Deactivate rather than hard delete!
      await db.query("UPDATE categories SET status = 'inactive' WHERE id = ?", [id]);
      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'DEACTIVATE_CATEGORY',
        details: `Deactivated category "${existing[0].name}" (ID #${id}) to safeguard linked menu items and historical bills`
      });

      return res.json({
        success: true,
        message: `Category "${existing[0].name}" contains menu items and was deactivated rather than deleted to protect historical bill integrity.`
      });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_CATEGORY',
      details: `Deleted empty category "${existing[0].name}" (ID #${id})`
    });

    res.json({ success: true, message: `Category "${existing[0].name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// MENU ITEMS MANAGEMENT (Section 3.2.D)
// ============================================================

// GET /api/menu - Get all menu items with search and filters
router.get('/', async (req, res, next) => {
  try {
    const { category, search, availableOnly } = req.query;
    let query = `
      SELECT m.id, m.name, m.description, m.price, m.available, m.image_url, 
             c.id AS category_id, c.name AS category_name, c.status AS category_status,
             m.created_at, m.updated_at
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
      query += ` AND m.available = 1 AND (c.status = 'active' OR c.status IS NULL)`;
    }

    query += ` ORDER BY c.name ASC, m.name ASC`;

    const [items] = await db.query(query, params);
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
});

// POST /api/menu - Add new food/beverage item (Admin only)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { name, category_id, price, description = '', available = 1, image_url = '' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
    }

    const [result] = await db.query(
      `INSERT INTO menu_items (category_id, name, description, price, available, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, name.trim(), description.trim(), numPrice, available ? 1 : 0, image_url ? image_url.trim() : '']
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

// PUT /api/menu/:id - Edit menu item / Update price (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, description, available, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
    }

    const [check] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const oldPrice = parseFloat(check[0].price);

    await db.query(
      `UPDATE menu_items 
       SET category_id = ?, name = ?, description = ?, price = ?, available = ?, image_url = ?
       WHERE id = ?`,
      [
        category_id || check[0].category_id,
        name.trim(),
        description !== undefined ? description.trim() : check[0].description,
        numPrice,
        available !== undefined ? (available ? 1 : 0) : check[0].available,
        image_url !== undefined ? image_url.trim() : check[0].image_url,
        id
      ]
    );

    const priceChangeNote = oldPrice !== numPrice ? ` | Price updated from ₹${oldPrice.toFixed(2)} to ₹${numPrice.toFixed(2)}` : '';

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: oldPrice !== numPrice ? 'PRICE_CHANGE' : 'UPDATE_MENU_ITEM',
      details: `Updated item #${id}: "${name.trim()}"${priceChangeNote} | Available: ${available ? 'Yes' : 'No'}`
    });

    res.json({
      success: true,
      message: `Menu item "${name.trim()}" updated successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/menu/:id/toggle - Toggle availability (Cashier, Admin)
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

// DELETE /api/menu/:id - Deactivate or delete menu item (Section 3.2.D & 3.2.E safeguard)
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Owner'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [items] = await db.query('SELECT name FROM menu_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    // Historical Safeguard: If item is in finalized order_items, deactivate it (available = 0)
    // rather than deleting, so past bills never break!
    const [historical] = await db.query('SELECT id FROM order_items WHERE menu_item_id = ? LIMIT 1', [id]);

    if (historical.length > 0) {
      await db.query('UPDATE menu_items SET available = 0 WHERE id = ?', [id]);
      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'DEACTIVATE_MENU_ITEM',
        details: `Marked "${items[0].name}" (ID #${id}) as permanently unavailable to safeguard historical bill records`
      });

      return res.json({
        success: true,
        message: `"${items[0].name}" is linked to past finalized bills and was deactivated (made unavailable) rather than deleted, safeguarding billing integrity.`
      });
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
