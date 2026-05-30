const db = require('../config/db');

async function main() {
    try {
        console.log('Adding "pickup_location" column to orders table...');
        
        // Check if column already exists
        const [cols] = await db.query("SHOW COLUMNS FROM orders LIKE 'pickup_location'");
        if (cols.length === 0) {
            await db.query("ALTER TABLE orders ADD COLUMN pickup_location VARCHAR(255) DEFAULT NULL");
            console.log('✅ Added "pickup_location" to orders');
        } else {
            console.log('ℹ️ Column "pickup_location" already exists in orders');
        }
        
        console.log('Done!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}
main();
