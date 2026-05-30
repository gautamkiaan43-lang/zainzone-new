const db = require('../config/db');
async function main() {
    try {
        const [rows] = await db.query('SELECT * FROM events WHERE name = "birthday"');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
main();
