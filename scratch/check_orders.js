const db = require('../config/db');

async function check() {
    try {
        const [orders] = await db.query('SELECT id, type, created_at FROM orders');
        console.log('Total orders:', orders.length);
        console.log('Orders:', orders);
    } catch (e) {
        console.error('ERR:', e);
    } finally {
        process.exit(0);
    }
}

check();
