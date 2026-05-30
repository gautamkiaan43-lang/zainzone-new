const db = require('../config/db');

async function check() {
    try {
        const [rows] = await db.query("SHOW CREATE TABLE support_tickets");
        console.log(rows[0]['Create Table']);
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
check();
