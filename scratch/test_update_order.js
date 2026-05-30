const db = require('../config/db');

async function test() {
    try {
        const [orders] = await db.query('SELECT id, items FROM orders LIMIT 1');
        if (orders.length === 0) {
            console.log('No orders found');
            return;
        }
        const order = orders[0];
        console.log('Original order:', order);

        // Try to update items
        const updatedItems = [{ name: 'sdfg', qty: 2, price: 150 }];
        const [res] = await db.query('UPDATE orders SET items = ? WHERE id = ?', [JSON.stringify(updatedItems), order.id]);
        console.log('Update result:', res);

        const [ordersAfter] = await db.query('SELECT id, items FROM orders WHERE id = ?', [order.id]);
        console.log('Updated order:', ordersAfter[0]);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

test();
