const pool = require('./config/db');

async function run() {
    try {
        console.log('Starting migration for self-signup customers...');
        
        // 1. Get all customer role users
        const [customerUsers] = await pool.query("SELECT * FROM users WHERE role = 'customer'");
        console.log(`Found ${customerUsers.length} customer users in total.`);
        
        let migratedCount = 0;
        let createdRecordCount = 0;

        for (const user of customerUsers) {
            let companyId = user.company_id;
            
            // If company_id is null, <= 0 or invalid, update it to 1 (ZaneZion HQ)
            if (!companyId || companyId <= 0) {
                console.log(`Updating company_id to 1 for user ID ${user.id} (${user.email})...`);
                await pool.query("UPDATE users SET company_id = 1 WHERE id = ?", [user.id]);
                companyId = 1;
                migratedCount++;
            }
            
            // 2. Check if this customer user exists in the 'customers' table
            const [custRecord] = await pool.query("SELECT * FROM customers WHERE email = ? OR created_by = ?", [user.email, user.id]);
            
            if (custRecord.length === 0) {
                console.log(`Creating missing customer record for user ID ${user.id} (${user.email}) under company ${companyId}...`);
                await pool.query(
                    `INSERT INTO customers (company_id, name, email, phone, client_type, status, created_by)
                     VALUES (?, ?, ?, ?, 'Direct', 'active', ?)`,
                    [companyId, user.name, user.email, user.phone || null, user.id]
                );
                createdRecordCount++;
            } else {
                // If they exist but company_id is mismatching, update customer company_id
                const existingCust = custRecord[0];
                if (existingCust.company_id !== companyId) {
                    console.log(`Aligning customer record company_id (${existingCust.company_id} -> ${companyId}) for ${user.email}...`);
                    await pool.query("UPDATE customers SET company_id = ? WHERE id = ?", [companyId, existingCust.id]);
                }
            }
        }
        
        console.log('Migration completed successfully!');
        console.log(`Aligned user company IDs: ${migratedCount}`);
        console.log(`Created new customer records: ${createdRecordCount}`);
        
    } catch (e) {
        console.error('Migration failed:', e.message, e.stack);
    } finally {
        process.exit(0);
    }
}

run();
