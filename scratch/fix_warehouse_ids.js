const db = require('../config/db');

async function fixWarehouseIds() {
    try {
        console.log("Connecting to database and updating warehouse IDs...");
        
        // Update IDs to positive numbers
        await db.query("UPDATE warehouses SET id = 10 WHERE name = 'Nassau Hub Warehouse'");
        await db.query("UPDATE warehouses SET id = 11 WHERE name = 'Nassau Port Storage'");

        console.log("Warehouse IDs successfully updated to 10 and 11!");
        
        const [updated] = await db.query("SELECT * FROM warehouses");
        console.log("Updated warehouses in DB:", updated);
        
        process.exit(0);
    } catch (err) {
        console.error("Error updating warehouse IDs:", err);
        process.exit(1);
    }
}

fixWarehouseIds();
