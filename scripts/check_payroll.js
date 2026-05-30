const db = require('../config/db');

async function run() {
    // Introspect payroll table name and rows
    const [tables] = await db.query("SHOW TABLES");
    console.log('Tables:', tables);
    
    // Check if payroll table exists
    const [rows] = await db.query("SELECT * FROM payroll ORDER BY id DESC LIMIT 5");
    console.log('Payroll rows:', JSON.stringify(rows, null, 2));
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
