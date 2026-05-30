const db = require('../config/db');

async function createWarehouse() {
    try {
        console.log("Connecting to database and creating warehouse...");
        
        // Let's check existing warehouses first
        const [existing] = await db.query("SELECT * FROM warehouses");
        console.log("Current warehouses in DB:", existing);

        // Insert new premium warehouse
        const name = "Nassau Port Storage";
        const location = "Nassau Main Port, Bahamas";
        const capacity = 10000;
        const status = "active";
        const company_id = null; // Globally scoped to all tenants

        const [result] = await db.query(
            `INSERT INTO warehouses (company_id, name, location, capacity, status) VALUES (?, ?, ?, ?, ?)`,
            [company_id, name, location, capacity, status]
        );

        console.log(`Successfully created new warehouse: "${name}" with ID: ${result.insertId}`);
        
        const [updated] = await db.query("SELECT * FROM warehouses");
        console.log("Updated warehouses in DB:", updated);
        
        process.exit(0);
    } catch (err) {
        console.error("Error creating warehouse:", err);
        process.exit(1);
    }
}

createWarehouse();
