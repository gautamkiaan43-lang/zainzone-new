const db = require('../config/db');

async function run() {
  try {
    console.log("Checking columns of 'guest_requests' table...");
    const [rows] = await db.query("DESCRIBE guest_requests");
    console.log("COLUMNS IN 'guest_requests' TABLE:");
    console.table(rows);
  } catch (err) {
    console.error("FAILED TO DESCRIBE 'guest_requests' TABLE:", err);
  } finally {
    await db.end();
  }
}

run();
