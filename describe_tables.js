const db = require('./config/db');

async function test() {
    try {
        const tables = ['orders', 'order_items', 'customers', 'users'];
        for (const table of tables) {
            console.log(`\n--- COLUMNS IN ${table.toUpperCase()} ---`);
            const [rows] = await db.query(`SHOW COLUMNS FROM ${table}`);
            rows.forEach(r => {
                console.log(`Field: ${r.Field.padEnd(20)} | Type: ${r.Type.padEnd(25)} | Null: ${r.Null} | Key: ${r.Key} | Default: ${r.Default}`);
            });
        }
    } catch (err) {
        console.error(err.message);
    }
    process.exit(0);
}
test();
