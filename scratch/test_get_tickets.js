const db = require('../config/db');

async function run() {
  try {
    console.log("Running getTickets SQL query simulation...");
    const [rows] = await db.query(
      `SELECT st.*, u.name as submitted_by_name FROM support_tickets st LEFT JOIN users u ON st.submitted_by = u.id WHERE 1=1 ORDER BY st.created_at DESC`
    );
    console.log("SQL SUCCESS! Rows returned:", rows.length);
    console.table(rows);
  } catch (err) {
    console.error("SQL QUERY FAILED:", err);
  } finally {
    await db.end();
  }
}

run();
