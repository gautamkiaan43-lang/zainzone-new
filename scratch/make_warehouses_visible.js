const db = require('../config/db');

async function makeWarehousesVisible() {
    try {
        console.log("Connecting to database and setting company_id to 1 for all warehouses...");
        
        // Update all warehouses to belong to Company 1 (HQ / Tenant)
        await db.query("UPDATE warehouses SET company_id = 1");

        console.log("Successfully set all warehouses' company_id to 1!");
        
        const [updated] = await db.query("SELECT * FROM warehouses");
        console.log("Current warehouses in DB:", updated);
        
        process.exit(0);
    } catch (err) {
        console.error("Error updating warehouses:", err);
        process.exit(1);
    }
}

makeWarehousesVisible();
