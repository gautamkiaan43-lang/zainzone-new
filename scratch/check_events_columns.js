const db = require('../config/db');
async function main() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM events');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
main();
