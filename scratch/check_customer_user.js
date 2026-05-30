const db = require('../config/db');

async function run() {
  try {
    console.log("Fetching Customer One user details...");
    const [rows] = await db.query("SELECT id, name, email, role, company_id FROM users WHERE name LIKE '%Customer%' OR id = 999");
    console.log("CUSTOMER USERS:");
    console.table(rows);
  } catch (err) {
    console.error("FAILED TO FETCH CUSTOMER USER:", err);
  } finally {
    await db.end();
  }
}

run();
