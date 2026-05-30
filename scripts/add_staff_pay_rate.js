const db = require('../config/db');

async function migrate() {
    try {
        console.log('Adding staff_pay_rate column to deliveries table...');
        await db.query('ALTER TABLE deliveries ADD COLUMN staff_pay_rate DECIMAL(10,2) DEFAULT 2.50');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    }
}
migrate();
