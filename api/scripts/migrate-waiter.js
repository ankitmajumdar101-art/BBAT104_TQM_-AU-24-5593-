const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function migrate() {
  console.log('1. Altering users.role enum...');
  await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('Owner','Admin','Cashier','Kitchen Staff','Waiter') NOT NULL");

  console.log('2. Checking / creating default waiter account...');
  const [existingWaiter] = await db.query('SELECT id FROM users WHERE username = ?', ['waiter']);
  if (existingWaiter.length === 0) {
    const hashed = await bcrypt.hash('waiter123', 10);
    await db.query(
      "INSERT INTO users (username, password, role, full_name, email, phone, status, must_change_password) " +
      "VALUES ('waiter', ?, 'Waiter', 'Sunil Kumar (Floor Captain)', 'waiter@royalfeast.com', '+91 98765 11223', 'active', 0)",
      [hashed]
    );
    console.log('✅ Default waiter user created.');
  } else {
    console.log('Default waiter user already exists.');
  }

  console.log('3. Checking / adding discount_percent column to menu_items...');
  const [menuCols] = await db.query('DESCRIBE menu_items');
  const hasDiscountCol = menuCols.some(c => c.Field === 'discount_percent');
  if (!hasDiscountCol) {
    await db.query('ALTER TABLE menu_items ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0.00 AFTER price');
    console.log('✅ discount_percent added to menu_items.');
  } else {
    console.log('discount_percent column already exists in menu_items.');
  }

  // Populate sample discounts on current dishes
  await db.query('UPDATE menu_items SET discount_percent = 10.00 WHERE id = 1'); // Paneer Tikka 10%
  await db.query('UPDATE menu_items SET discount_percent = 15.00 WHERE id = 4'); // Chicken Biryani 15%
  await db.query('UPDATE menu_items SET discount_percent = 5.00 WHERE id = 2');  // Veg Spring Rolls 5%
  await db.query('UPDATE menu_items SET discount_percent = 12.00 WHERE id = 8'); // Margherita Pizza 12%
  await db.query('UPDATE menu_items SET discount_percent = 20.00 WHERE id = 5'); // Paneer Butter Masala 20%
  console.log('✅ Updated sample dish discounts.');

  console.log('4. Creating restaurant_tables table...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_number INT NOT NULL UNIQUE,
      capacity INT NOT NULL DEFAULT 4,
      status ENUM('Available', 'Seated', 'Order Placed', 'Bill Ready', 'Food Ready', 'Served') NOT NULL DEFAULT 'Available',
      customer_name VARCHAR(100) DEFAULT '',
      customer_phone VARCHAR(20) DEFAULT '',
      guests_count INT DEFAULT 1,
      current_order_id INT NULL,
      assigned_waiter_id INT NULL,
      assigned_waiter_name VARCHAR(100) DEFAULT '',
      seated_at TIMESTAMP NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ restaurant_tables table verified.');

  // Seed tables 1 to 12 if not present
  const [tables] = await db.query('SELECT COUNT(*) as cnt FROM restaurant_tables');
  if (tables[0].cnt === 0) {
    const tableSeeds = [
      [1, 2], [2, 2], [3, 4], [4, 4], [5, 4], [6, 4],
      [7, 6], [8, 6], [9, 8], [10, 4], [11, 2], [12, 6]
    ];
    for (const [tblNum, cap] of tableSeeds) {
      await db.query(
        'INSERT INTO restaurant_tables (table_number, capacity, status) VALUES (?, ?, "Available")',
        [tblNum, cap]
      );
    }
    console.log('✅ Seeded 12 tables into restaurant_tables.');
  }

  console.log('5. Checking / adding waiter and tracking columns to orders...');
  const [orderCols] = await db.query('DESCRIBE orders');
  const cols = orderCols.map(c => c.Field);
  
  if (!cols.includes('waiter_id')) {
    await db.query('ALTER TABLE orders ADD COLUMN waiter_id INT NULL AFTER created_by');
    console.log('✅ waiter_id added to orders.');
  }
  if (!cols.includes('waiter_name')) {
    await db.query('ALTER TABLE orders ADD COLUMN waiter_name VARCHAR(100) DEFAULT "" AFTER waiter_id');
    console.log('✅ waiter_name added to orders.');
  }
  if (!cols.includes('table_status')) {
    await db.query('ALTER TABLE orders ADD COLUMN table_status VARCHAR(50) DEFAULT "Seated" AFTER waiter_name');
    console.log('✅ table_status added to orders.');
  }
  if (!cols.includes('bill_delivered_to_customer')) {
    await db.query('ALTER TABLE orders ADD COLUMN bill_delivered_to_customer TINYINT(1) DEFAULT 0 AFTER table_status');
    console.log('✅ bill_delivered_to_customer added to orders.');
  }
  if (!cols.includes('food_served_to_table')) {
    await db.query('ALTER TABLE orders ADD COLUMN food_served_to_table TINYINT(1) DEFAULT 0 AFTER bill_delivered_to_customer');
    console.log('✅ food_served_to_table added to orders.');
  }

  console.log('🎉 Database migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
