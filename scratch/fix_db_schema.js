const db = require('../config/db');

async function run() {
    try {
        console.log("Starting DB Schema inspection & fix...");

        // 1. Describe notifications table
        try {
            const [notifCols] = await db.query("DESCRIBE notifications");
            console.log("Current notifications schema:");
            console.table(notifCols);
        } catch (e) {
            console.error("Failed to describe notifications:", e.message);
        }

        // 2. Fix notifications AUTO_INCREMENT if needed
        try {
            console.log("Applying auto-increment fix to notifications.id...");
            await db.query("ALTER TABLE notifications MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT");
            console.log("✅ notifications.id set to AUTO_INCREMENT successfully.");
        } catch (e) {
            console.error("Failed to alter notifications.id:", e.message);
        }

        // 3. Add mood_board_url to events
        try {
            console.log("Adding mood_board_url to events...");
            await db.query("ALTER TABLE events ADD COLUMN mood_board_url VARCHAR(500) DEFAULT NULL");
            console.log("✅ Added mood_board_url to events successfully.");
        } catch (e) {
            if (e.message.includes("Duplicate column name")) {
                console.log("ℹ️ mood_board_url already exists in events.");
            } else {
                console.error("Failed to add mood_board_url to events:", e.message);
            }
        }

        // 4. Add mode to deliveries
        try {
            console.log("Adding mode to deliveries...");
            await db.query("ALTER TABLE deliveries ADD COLUMN mode VARCHAR(50) DEFAULT 'Road'");
            console.log("✅ Added mode to deliveries successfully.");
        } catch (e) {
            if (e.message.includes("Duplicate column name")) {
                console.log("ℹ️ mode already exists in deliveries.");
            } else {
                console.error("Failed to add mode to deliveries:", e.message);
            }
        }

        // 5. Describe tables again to verify
        const [notifColsAfter] = await db.query("DESCRIBE notifications");
        console.log("Updated notifications schema:");
        console.table(notifColsAfter);

        console.log("Schema upgrades finished.");
        process.exit(0);
    } catch (err) {
        console.error("Error running schema upgrade:", err);
        process.exit(1);
    }
}

run();
