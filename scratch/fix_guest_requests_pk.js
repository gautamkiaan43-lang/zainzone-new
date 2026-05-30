const db = require('../config/db');

async function run() {
  try {
    console.log("Fixing 'guest_requests' table primary key and auto-increment...");

    // 1. Fetch all existing guest requests
    const [rows] = await db.query("SELECT * FROM guest_requests ORDER BY created_at ASC");
    console.log(`Found ${rows.length} existing guest requests.`);

    // 2. Temporarily rename or update their IDs to be sequential starting from 1
    for (let i = 0; i < rows.length; i++) {
      const newId = i + 1;
      const oldRow = rows[i];
      // We identify by created_at since all IDs are 0
      await db.query(
        "UPDATE guest_requests SET id = ? WHERE created_at = ? AND guest = ? LIMIT 1",
        [newId, oldRow.created_at, oldRow.guest]
      );
      console.log(`Updated guest request "${oldRow.guest}" to ID ${newId}`);
    }

    // 3. Alter the table to make 'id' a PRIMARY KEY
    console.log("Adding PRIMARY KEY constraint to 'id'...");
    await db.query("ALTER TABLE guest_requests ADD PRIMARY KEY (id)");

    // 4. Alter the column to add AUTO_INCREMENT
    console.log("Adding AUTO_INCREMENT to 'id'...");
    await db.query("ALTER TABLE guest_requests MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT");

    console.log("✅ Table 'guest_requests' altered successfully!");

    // Double check
    const [cols] = await db.query("DESCRIBE guest_requests");
    console.table(cols);
  } catch (err) {
    console.error("❌ FAILED TO ALTER TABLE:", err.message);
  } finally {
    await db.end();
  }
}

run();
