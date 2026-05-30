const db = require('../config/db');

async function run() {
    const [rows] = await db.query('SELECT id, name, role, status FROM users ORDER BY id');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
