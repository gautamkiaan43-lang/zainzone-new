const db = require('../config/db');
async function main() {
    try {
        const [rows] = await db.query('SELECT * FROM events ORDER BY id DESC LIMIT 1');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
main();
