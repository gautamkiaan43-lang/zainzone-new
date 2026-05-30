const db = require('../config/db');

async function run() {
  try {
    console.log("Fixing 'support_tickets' table primary key and auto-increment...");

    // 1. Fetch all existing support tickets
    const [rows] = await db.query("SELECT * FROM support_tickets ORDER BY created_at ASC");
    console.log(`Found ${rows.length} existing support tickets.`);

    // 2. Update their IDs to be sequential starting from 1
    for (let i = 0; i < rows.length; i++) {
      const newId = i + 1;
      const oldRow = rows[i];
      // We identify by created_at since all IDs are 0
      await db.query(
        "UPDATE support_tickets SET id = ? WHERE created_at = ? AND subject = ? LIMIT 1",
        [newId, oldRow.created_at, oldRow.subject]
      );
      console.log(`Updated support ticket "${oldRow.subject}" to ID ${newId}`);
    }

    // 3. Alter the table to make 'id' a PRIMARY KEY
    console.log("Adding PRIMARY KEY constraint to 'id'...");
    await db.query("ALTER TABLE support_tickets ADD PRIMARY KEY (id)");

    // 4. Alter the column to add AUTO_INCREMENT
    console.log("Adding AUTO_INCREMENT to 'id'...");
    await db.query("ALTER TABLE support_tickets MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT");

    console.log("✅ Table 'support_tickets' altered successfully!");

    // Double check
    const [cols] = await db.query("DESCRIBE support_tickets");
    console.table(cols);
  } catch (err) {
    console.error("❌ FAILED TO ALTER TABLE:", err.message);
  } finally {
    await db.end();
  }
}

run();
