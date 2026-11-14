const db = require('../config/db');

async function migrateRoomsAndChairs() {
  console.log('--- STARTING ROOMS, TABLES & CHAIRS MIGRATION ---');

  // 1. Create restaurant_rooms table
  console.log('1. Creating restaurant_rooms table...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS restaurant_rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      floor_number INT NOT NULL DEFAULT 0,
      description VARCHAR(255) DEFAULT '',
      status ENUM('Active', 'Maintenance', 'Closed') NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ restaurant_rooms table verified.');

  // 2. Add columns to restaurant_tables
  console.log('2. Updating restaurant_tables columns...');
  const [tblCols] = await db.query('DESCRIBE restaurant_tables');
  const tblColNames = tblCols.map(c => c.Field);

  if (!tblColNames.includes('room_id')) {
    await db.query('ALTER TABLE restaurant_tables ADD COLUMN room_id INT NULL AFTER id');
    console.log('✅ room_id column added to restaurant_tables.');
  }
  if (!tblColNames.includes('room_name')) {
    await db.query('ALTER TABLE restaurant_tables ADD COLUMN room_name VARCHAR(100) DEFAULT "Ground Floor" AFTER room_id');
    console.log('✅ room_name column added to restaurant_tables.');
  }

  // 3. Add chair columns to order_items
  console.log('3. Updating order_items columns for chair-based ordering...');
  const [orderItemCols] = await db.query('DESCRIBE order_items');
  const orderItemColNames = orderItemCols.map(c => c.Field);

  if (!orderItemColNames.includes('chair_number')) {
    await db.query('ALTER TABLE order_items ADD COLUMN chair_number INT NULL DEFAULT 1 AFTER quantity');
    console.log('✅ chair_number column added to order_items.');
  }
  if (!orderItemColNames.includes('chair_label')) {
    await db.query('ALTER TABLE order_items ADD COLUMN chair_label VARCHAR(50) DEFAULT "Chair 1" AFTER chair_number');
    console.log('✅ chair_label column added to order_items.');
  }

  // 4. Add room columns to orders
  console.log('4. Updating orders columns...');
  const [orderCols] = await db.query('DESCRIBE orders');
  const orderColNames = orderCols.map(c => c.Field);

  if (!orderColNames.includes('room_id')) {
    await db.query('ALTER TABLE orders ADD COLUMN room_id INT NULL AFTER table_number');
    console.log('✅ room_id column added to orders.');
  }
  if (!orderColNames.includes('room_name')) {
    await db.query('ALTER TABLE orders ADD COLUMN room_name VARCHAR(100) DEFAULT "" AFTER room_id');
    console.log('✅ room_name column added to orders.');
  }

  // 5. Seed default Rooms/Floors
  console.log('5. Seeding default Rooms / Floors...');
  const defaultRooms = [
    { name: 'Ground Floor (Main Dining Hall)', floor_number: 0, description: 'Spacious ground floor dining hall with active floor service' },
    { name: 'First Floor (Family AC Hall)', floor_number: 1, description: 'Quiet air-conditioned family dining room on the first floor' },
    { name: 'Rooftop (Garden Lounge)', floor_number: 2, description: 'Open-air ambient garden terrace with skyline city view' }
  ];

  for (const r of defaultRooms) {
    const [existing] = await db.query('SELECT id FROM restaurant_rooms WHERE name = ?', [r.name]);
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO restaurant_rooms (name, floor_number, description, status) VALUES (?, ?, ?, "Active")',
        [r.name, r.floor_number, r.description]
      );
      console.log(`✅ Seeded Room: ${r.name}`);
    }
  }

  // Fetch rooms
  const [rooms] = await db.query('SELECT * FROM restaurant_rooms ORDER BY floor_number ASC');
  const groundFloor = rooms.find(r => r.name.includes('Ground')) || rooms[0];
  const firstFloor = rooms.find(r => r.name.includes('First')) || rooms[1] || rooms[0];
  const rooftop = rooms.find(r => r.name.includes('Rooftop')) || rooms[2] || rooms[0];

  // 6. Seed each room with 10 tables of 4 chairs each (Total 30 tables: 1-10 Ground, 11-20 1st Floor, 21-30 Rooftop)
  console.log('6. Ensuring 10 tables with 4 chairs per room...');
  
  // Ground Floor: Tables 1 to 10
  for (let i = 1; i <= 10; i++) {
    const [existing] = await db.query('SELECT id FROM restaurant_tables WHERE table_number = ?', [i]);
    if (existing.length > 0) {
      await db.query(
        'UPDATE restaurant_tables SET room_id = ?, room_name = ?, capacity = 4 WHERE table_number = ?',
        [groundFloor.id, groundFloor.name, i]
      );
    } else {
      await db.query(
        'INSERT INTO restaurant_tables (table_number, room_id, room_name, capacity, status) VALUES (?, ?, ?, 4, "Available")',
        [i, groundFloor.id, groundFloor.name]
      );
    }
  }

  // First Floor: Tables 11 to 20
  for (let i = 11; i <= 20; i++) {
    const [existing] = await db.query('SELECT id FROM restaurant_tables WHERE table_number = ?', [i]);
    if (existing.length > 0) {
      await db.query(
        'UPDATE restaurant_tables SET room_id = ?, room_name = ?, capacity = 4 WHERE table_number = ?',
        [firstFloor.id, firstFloor.name, i]
      );
    } else {
      await db.query(
        'INSERT INTO restaurant_tables (table_number, room_id, room_name, capacity, status) VALUES (?, ?, ?, 4, "Available")',
        [i, firstFloor.id, firstFloor.name]
      );
    }
  }

  // Rooftop Lounge: Tables 21 to 30
  for (let i = 21; i <= 30; i++) {
    const [existing] = await db.query('SELECT id FROM restaurant_tables WHERE table_number = ?', [i]);
    if (existing.length > 0) {
      await db.query(
        'UPDATE restaurant_tables SET room_id = ?, room_name = ?, capacity = 4 WHERE table_number = ?',
        [rooftop.id, rooftop.name, i]
      );
    } else {
      await db.query(
        'INSERT INTO restaurant_tables (table_number, room_id, room_name, capacity, status) VALUES (?, ?, ?, 4, "Available")',
        [i, rooftop.id, rooftop.name]
      );
    }
  }

  console.log('✅ Seeded 10 tables with 4 chairs for Ground Floor, 1st Floor, and Rooftop!');
  console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

migrateRoomsAndChairs().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
