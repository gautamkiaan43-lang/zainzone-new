// seed_company.js — Seed a company + link users & customers to it
// Run: node scratch/seed_company.js

const pool = require('../config/db');

async function seed() {
  try {
    // 1. Insert HQ company (id=1)
    await pool.query(`DELETE FROM companies WHERE id = 1`);
    await pool.query(
      `INSERT INTO companies (id, name, email, phone, location, plan, status, client_type, tenant_type)
       VALUES (1, 'Zanezion HQ', 'admin@zanezion.com', '+1-555-0001', 'Nassau, Bahamas', 'Premium', 'active', 'Business', 'zanezion')`
    );
    console.log('✅ Company seeded (id=1, Zanezion HQ)');

    // 2. Update all users to belong to company 1
    const [userResult] = await pool.query(`UPDATE users SET company_id = 1 WHERE company_id IS NULL`);
    console.log(`✅ Updated ${userResult.affectedRows} users → company_id=1`);

    // 3. Update all customers to belong to company 1
    const [custResult] = await pool.query(`UPDATE customers SET company_id = 1 WHERE company_id IS NULL OR company_id = 0`);
    console.log(`✅ Updated ${custResult.affectedRows} customers → company_id=1`);

    // 4. Verify
    const [companies] = await pool.query('SELECT id, name FROM companies');
    console.log('Companies:', companies);
    const [customers] = await pool.query('SELECT id, name, email, client_type FROM customers');
    console.log('Customers:', customers);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
