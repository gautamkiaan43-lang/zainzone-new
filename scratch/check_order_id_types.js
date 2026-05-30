const db = require('../config/db');

async function check() {
    try {
        const [orders] = await db.query('SELECT id, CAST(id AS CHAR) as id_str, type FROM orders');
        console.log('Orders raw types:', orders.map(o => ({ id: o.id, id_type: typeof o.id, id_str: o.id_str, id_str_type: typeof o.id_str })));
    } catch (e) {
        console.error('ERR:', e);
    } finally {
        process.exit(0);
    }
}

check();
