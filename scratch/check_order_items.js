const db = require('../config/db');

async function check() {
    try {
        console.log('DESCRIBE order_items:');
        const [schema] = await db.query('DESCRIBE order_items');
        console.table(schema);

        const [items] = await db.query('SELECT * FROM order_items');
        console.log('Total order items:', items.length);
        console.log('Order items:', items);
    } catch (e) {
        console.error('ERR:', e);
    } finally {
        process.exit(0);
    }
}

check();
