const db = require('./config/db');

async function main() {
    const [rows] = await db.query('SELECT id, name, status, company_id FROM vendors');
    console.log('Vendors:', rows);
}
main().catch(console.error);
