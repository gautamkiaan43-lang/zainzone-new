const db = require('../config/db');

async function run() {
  try {
    console.log("Checking columns of 'support_tickets' table...");
    const [rows] = await db.query("DESCRIBE support_tickets");
    console.log("COLUMNS IN 'support_tickets' TABLE:");
    console.table(rows);
  } catch (err) {
    console.error("FAILED TO DESCRIBE 'support_tickets' TABLE:", err);
  } finally {
    await db.end();
  }
}

run();
