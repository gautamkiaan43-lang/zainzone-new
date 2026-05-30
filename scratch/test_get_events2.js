const db = require('./config/db');

async function test() {
    const [rows] = await db.query('SELECT id, name FROM events');
    console.log(rows);
    process.exit(0);
}
test();
