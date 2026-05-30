const db = require('./config/db');

async function test() {
    try {
        const tables = ['orders', 'order_items', 'customers'];
        for (const table of tables) {
            console.log(`\n--- NOT NULL columns in ${table.toUpperCase()} ---`);
            const [rows] = await db.query(`SHOW COLUMNS FROM ${table}`);
            rows.forEach(r => {
                if (r.Null === 'NO') {
                    console.log(`Field: ${r.Field} | Type: ${r.Type} | Key: ${r.Key} | Default: ${r.Default}`);
                }
            });
        }
    } catch (err) {
        console.error(err.message);
    }
    process.exit(0);
}
test();
