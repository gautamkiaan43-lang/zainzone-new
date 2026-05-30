const db = require('../config/db');

async function run() {
    const [rows] = await db.query('SELECT id, route_distance, staff_pay_rate, delivery_fee FROM deliveries ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
