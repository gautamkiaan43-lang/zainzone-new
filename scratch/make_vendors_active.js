const db = require('../config/db');

async function makeVendorsActive() {
    try {
        console.log("Connecting to database and setting status to 'active' for all vendors...");
        
        // Update all vendors to have 'active' status
        await db.query("UPDATE vendors SET status = 'active'");

        console.log("Successfully set all vendors' status to 'active'!");
        
        const [updated] = await db.query("SELECT id, name, status FROM vendors");
        console.log("Current vendors in DB:", updated);
        
        process.exit(0);
    } catch (err) {
        console.error("Error updating vendors:", err);
        process.exit(1);
    }
}

makeVendorsActive();
