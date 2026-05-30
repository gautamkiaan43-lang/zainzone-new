const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zanezone',
  });
  
  try {
    await db.query('ALTER TABLE purchase_orders ADD COLUMN packing_slip VARCHAR(255) NULL');
    console.log('Added packing_slip');
  } catch (e) { console.log(e.message); }

  try {
    await db.query('ALTER TABLE purchase_orders ADD COLUMN admin_approved BOOLEAN DEFAULT FALSE');
    console.log('Added admin_approved');
  } catch (e) { console.log(e.message); }

  try {
    await db.query("ALTER TABLE purchase_orders MODIFY COLUMN status ENUM('Pending', 'Partially Received', 'Received', 'Cancelled', 'Pending Receipt Approval') DEFAULT 'Pending'");
    console.log('Modified status enum');
  } catch (e) { console.log(e.message); }

  process.exit(0);
}

run().catch(console.error);
