const db = require('./config/db');

async function run() {
    try {
        await db.query('INSERT INTO order_items (order_id, product_name) VALUES (1, null)');
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
run();
