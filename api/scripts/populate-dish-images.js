const db = require('../config/db');

const DISH_IMAGE_MAP = {
  'Paneer Tikka': 'https://images.unsplash.com/photo-1666001120694-3ebe8fd207be?auto=format&fit=crop&w=600&q=80',
  'Veg Spring Rolls': 'https://images.unsplash.com/photo-1786174045051-673a64444d72?auto=format&fit=crop&w=600&q=80',
  'Hot Tomato Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  'Butter Naan': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
  'Masala Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  'Veg Cheese Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'Cold Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
  'Masala Chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&q=80',
  'Chocolate Brownie with Ice Cream': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  'Tandoori Stuffed Soya Chaap': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
};

async function populateImages() {
  console.log('--- POPULATING MENU ITEMS WITH DELICIOUS DISH IMAGES ---');
  let updatedCount = 0;

  for (const [dishName, imageUrl] of Object.entries(DISH_IMAGE_MAP)) {
    const [result] = await db.query(
      `UPDATE menu_items SET image_url = ? WHERE name = ?`,
      [imageUrl, dishName]
    );
    if (result.affectedRows > 0) {
      console.log(`✅ Updated ${result.affectedRows} items for "${dishName}"`);
      updatedCount += result.affectedRows;
    }
  }

  // Also backfill existing order_items with image_url from menu_items
  const [backfillResult] = await db.query(`
    UPDATE order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    SET oi.image_url = m.image_url
    WHERE oi.image_url IS NULL OR oi.image_url = ''
  `);
  console.log(`✅ Backfilled ${backfillResult.affectedRows} historical order line items with dish images.`);

  console.log(`🎉 COMPLETED: ${updatedCount} menu items populated with images!`);
  process.exit(0);
}

populateImages().catch(err => {
  console.error('Population error:', err);
  process.exit(1);
});
