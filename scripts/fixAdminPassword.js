// scripts/fixAdminPassword.js
/**
 * fixAdminPassword.js
 * -------------------
 * Utility script to replace the malformed admin password hashes
 * with a proper bcrypt hash for the known plain‑text password
 * `123456`. It uses the same DB wrapper (`config/db.js`) that the
 * application uses, ensuring the query goes through the same
 * translation layer (MySQL↔PostgreSQL). The UPDATE includes
 * `RETURNING *` so PostgreSQL actually writes the new hash.
 */

require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const plainPassword = '123456';
const hash = bcrypt.hashSync(plainPassword, 10);

const adminEmails = ['admin@zanezion.com', 'admin@demo.com'];

async function updatePassword(email) {
  const sql = 'UPDATE users SET password = ? WHERE email = ? RETURNING *';
  try {
    const [rows] = await db.query(sql, [hash, email]);
    console.log(`✅ Updated password for ${email}:`, rows[0]?.password);
  } catch (err) {
    console.error(`❌ Failed to update ${email}:`, err);
  }
}

async function main() {
  for (const email of adminEmails) {
    await updatePassword(email);
  }
  await db.end();
}

main();
