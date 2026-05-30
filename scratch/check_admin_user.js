const db = require('../config/db');

async function run() {
  try {
    console.log("Fetching admin user details...");
    const [rows] = await db.query("SELECT id, name, email, role, company_id FROM users WHERE role = 'admin' OR role = 'super_admin'");
    console.log("ADMIN USERS:");
    console.table(rows);
  } catch (err) {
    console.error("FAILED TO FETCH ADMIN USER:", err);
  } finally {
    await db.end();
  }
}

run();
