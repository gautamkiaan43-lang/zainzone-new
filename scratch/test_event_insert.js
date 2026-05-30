const db = require('../config/db');

async function run() {
  try {
    console.log("Starting DB insert test...");
    const companyId = 2; // Let's simulate a standard company
    const name = "Test Event via Script";
    const event_date = "2026-06-01";
    const location = "Test Palace";
    const cleanClientId = 1;
    const manager_id = 1;
    const finalStatus = "planned";
    const imageUrl = null;
    const special_requests = "None";
    const planner_name = "Agent";
    const guest_count = 50;
    const mood_board_url = "http://test.com";

    const [result] = await db.query(
        `INSERT INTO events (company_id, name, event_date, location, client_id, manager_id, status, image_url, special_requests, planner_name, guest_count, mood_board_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, event_date || null, location || null, cleanClientId, manager_id, finalStatus, imageUrl, special_requests || null, planner_name || null, guest_count || 0, mood_board_url || null]
    );
    console.log("INSERT Success! result:", result);
  } catch (err) {
    console.error("INSERT FAILED WITH ERROR:", err);
  } finally {
    await db.end();
  }
}

run();
