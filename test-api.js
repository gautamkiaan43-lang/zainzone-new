const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function run() {
  const c = await mysql.createConnection({host:'localhost', user:'root', password:'', database:'zanezone'});
  const [rows] = await c.query("SELECT * FROM users WHERE role = 'concierge' LIMIT 1");
  await c.end();

  const user = rows[0];
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, 'your-super-secret-jwt-key-change-this');

  try {
    const res = await axios.post('http://localhost:5000/api/orders', {
      items: [{name: 'Test item', price: 10, qty: 1}],
      client_id: 1,
      type: 'Marketplace Order'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
}
run().catch(console.error);
