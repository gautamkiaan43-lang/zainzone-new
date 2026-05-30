const db = require('../config/db');

async function run() {
    try {
        await db.query('ALTER TABLE deliveries ADD COLUMN route_distance DECIMAL(10,2) DEFAULT NULL');
        console.log('route_distance column added successfully');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('route_distance column already exists');
        } else {
            console.error('Error:', e.message);
        }
    }
    process.exit(0);
}

run();
