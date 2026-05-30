const db = require('../config/db');

async function fixDatabaseKeys() {
    try {
        console.log('Starting DB key diagnosis and fix...');
        const [tables] = await db.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log(`Found ${tableNames.length} tables in the database.`);

        for (const table of tableNames) {
            try {
                const [cols] = await db.query(`SHOW COLUMNS FROM ${table}`);
                const idCol = cols.find(c => c.Field === 'id');

                if (!idCol) {
                    console.log(`ℹ️ Table "${table}" has no "id" column. Skipping.`);
                    continue;
                }

                const isAutoIncrement = idCol.Extra.includes('auto_increment');
                const isPrimaryKey = idCol.Key === 'PRI';

                if (isAutoIncrement && isPrimaryKey) {
                    console.log(`✅ Table "${table}" already has AUTO_INCREMENT and PRIMARY KEY on "id".`);
                    continue;
                }

                if (isPrimaryKey && !isAutoIncrement) {
                    console.log(`🔧 Table "${table}" has PRIMARY KEY but missing AUTO_INCREMENT. Adding AUTO_INCREMENT...`);
                    await db.query(`ALTER TABLE ${table} MODIFY COLUMN id INT AUTO_INCREMENT`);
                    console.log(`  🎉 Successfully added AUTO_INCREMENT to table "${table}"!`);
                    continue;
                }

                console.log(`🔧 Table "${table}" has "id" but missing AUTO_INCREMENT and PRIMARY KEY. Key: "${idCol.Key}", Extra: "${idCol.Extra}". Fixing...`);

                // Check for duplicates/zeros in id column
                const [dupCheck] = await db.query(`SELECT id, COUNT(*) as count FROM ${table} GROUP BY id HAVING count > 1`);
                const [zeroCheck] = await db.query(`SELECT COUNT(*) as count FROM ${table} WHERE id = 0`);
                const hasZero = zeroCheck[0] && zeroCheck[0].count > 0;

                if (dupCheck.length > 0 || hasZero) {
                    console.log(`⚠️ Table "${table}" has duplicate or zero id values. Auto-assigning sequential IDs...`);
                    
                    // Assign sequential IDs: we need to disable foreign key checks or run single queries
                    await db.query('SET FOREIGN_KEY_CHECKS = 0');
                    // We run UPDATE using a session variable
                    await db.query('SET @i = 0');
                    await db.query(`UPDATE ${table} SET id = (@i:=@i+1)`);
                    await db.query('SET FOREIGN_KEY_CHECKS = 1');
                    console.log(`  ✅ Re-sequenced "id" column in table "${table}".`);
                }

                // Apply the AUTO_INCREMENT PRIMARY KEY fix
                await db.query(`ALTER TABLE ${table} MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY`);
                console.log(`  🎉 Successfully added AUTO_INCREMENT and PRIMARY KEY to table "${table}"!`);

            } catch (tableErr) {
                console.error(`❌ Failed to process or fix table "${table}":`, tableErr.message);
            }
        }

        console.log('\nDB key fix completed.');
    } catch (err) {
        console.error('❌ Error during script execution:', err.message);
    }
    process.exit(0);
}

fixDatabaseKeys();
