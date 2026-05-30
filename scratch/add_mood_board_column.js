const db = require('../config/db');

async function run() {
  try {
    console.log("Altering 'events' table to add 'mood_board_url' column...");
    await db.query("ALTER TABLE events ADD COLUMN mood_board_url VARCHAR(500) DEFAULT NULL");
    console.log("✅ Column 'mood_board_url' added successfully!");

    // Double check
    const [rows] = await db.query("DESCRIBE events");
    console.table(rows);
  } catch (err) {
    console.error("❌ FAILED TO ADD 'mood_board_url' COLUMN:", err.message);
  } finally {
    await db.end();
  }
}

run();
