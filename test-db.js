const mysql = require('mysql2/promise');
async function run() {
  const c = await mysql.createConnection({host:'localhost', user:'root', password:'', database:'zanezone'});
  const [rows] = await c.query("SELECT * FROM menu_permissions WHERE role = 'concierge' AND menu_name = 'Orders'");
  console.log(rows);
  await c.end();
}
run().catch(console.error);
