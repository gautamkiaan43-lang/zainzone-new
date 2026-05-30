const db = require('../config/db');

async function run() {
    try {
        const [ordersCols] = await db.query('DESCRIBE orders');
        console.log('orders schema:');
        console.log(JSON.stringify(ordersCols, null, 2));

        const [prCols] = await db.query('DESCRIBE purchase_requests');
        console.log('purchase_requests schema:');
        console.log(JSON.stringify(prCols, null, 2));
    } catch (e) {
        console.error('ERR:', e);
    } finally {
        process.exit(0);
    }
}

run();
