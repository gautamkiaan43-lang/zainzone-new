// dummy_data.js
// Script to insert dummy customers and vendors for frontend dropdown testing
// Run from the backend project root: `node scratch/dummy_data.js`

const pool = require('../config/db'); // adjust path if needed

async function insertDummyData() {
  // Clear existing dummy data to prevent duplicate primary key errors
  await pool.query('DELETE FROM customers');
  await pool.query('DELETE FROM vendors');
  try {
    // Use existing demo company (id=2) or fallback to first company
    const [companyRows] = await pool.query('SELECT id FROM companies LIMIT 1');
    const companyId = companyRows.length ? companyRows[0].id : 1;

    // Dummy customers
    const customers = [
      { name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0100' },
      { name: 'Globex Ltd', email: 'info@globex.com', phone: '+1-555-0200' },
      { name: 'Initech', email: 'hello@initech.com', phone: '+1-555-0300' },
      { name: 'John Doe', email: 'john@personal.com', phone: '+1-555-0400' }
    ];

    let custId = Math.floor(Math.random() * 10000) + 1000;
    for (const cust of customers) {
      // Remove any existing record with same email to prevent duplicate key errors
      await pool.query(`DELETE FROM customers WHERE email = ?`, [cust.email]);
      await pool.query(
        `INSERT INTO customers (id, company_id, name, email, phone, client_type, status) VALUES (?, ?, ?, ?, ?, 'Individual', 'active')`,
        [custId++, companyId, cust.name, cust.email, cust.phone]
      );
    }

    // Dummy vendors
    const vendors = [
      { name: 'Vendor One', email: 'vendor1@example.com', phone: '+1-555-1000' },
      { name: 'Vendor Two', email: 'vendor2@example.com', phone: '+1-555-2000' },
      { name: 'Vendor Three', email: 'vendor3@example.com', phone: '+1-555-3000' }
    ];

    let vendId = Math.floor(Math.random() * 10000) + 1000;
    for (const vend of vendors) {
      // Remove any existing vendor with same email
      await pool.query(`DELETE FROM vendors WHERE email = ?`, [vend.email]);
      await pool.query(
        `INSERT INTO vendors (id, company_id, name, email, phone, status) VALUES (?, ?, ?, ?, ?, 'active')`,
        [vendId++, companyId, vend.name, vend.email, vend.phone]
      );
    }

    console.log('✅ Dummy customers and vendors inserted successfully.');
  } catch (err) {
    console.error('❌ Error inserting dummy data:', err.message);
  } finally {
    process.exit(0);
  }
}

insertDummyData();
