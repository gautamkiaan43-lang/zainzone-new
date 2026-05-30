const db = require('./config/db');

async function fixEventsTable() {
    try {
        console.log("Altering table to add AUTO_INCREMENT...");
        await db.query('ALTER TABLE events MODIFY id INT NOT NULL AUTO_INCREMENT PRIMARY KEY');
        console.log("✅ Fixed events table successfully!");
    } catch (e) {
        if (e.message.includes("Multiple primary key defined")) {
            console.log("Primary key already exists, just adding auto_increment...");
            try {
                await db.query('ALTER TABLE events MODIFY id INT NOT NULL AUTO_INCREMENT');
                console.log("✅ Fixed events table successfully!");
            } catch (e2) {
                console.error("Failed second attempt:", e2);
            }
        } else {
            console.error("Error fixing table:", e);
        }
    }
    process.exit(0);
}

fixEventsTable();
