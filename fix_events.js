const db = require('./config/db');

async function fixEventsTable() {
    try {
        console.log("Deleting rows with id=0...");
        await db.query('DELETE FROM events WHERE id = 0');
        
        console.log("Altering table to add AUTO_INCREMENT...");
        await db.query('ALTER TABLE events MODIFY id INT AUTO_INCREMENT');
        
        console.log("✅ Fixed events table successfully!");
    } catch (e) {
        console.error("Error fixing table:", e);
    }
    process.exit(0);
}

fixEventsTable();
