const db = require('../config/db');

async function run() {
    console.log('Fixing driver assignment for delivery 36 in database...');
    await db.query('UPDATE deliveries SET assigned_driver = 97 WHERE id = 36');
    console.log('Successfully updated assignment.');
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
