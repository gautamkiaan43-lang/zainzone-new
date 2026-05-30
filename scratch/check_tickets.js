const db = require('../config/db');

async function check() {
    try {
        const [rows] = await db.query("SELECT * FROM support_tickets ORDER BY id DESC LIMIT 10");
        console.log("Support Tickets:", rows);
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
check();
