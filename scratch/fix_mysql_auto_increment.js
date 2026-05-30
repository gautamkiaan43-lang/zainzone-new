const db = require('../config/db');

async function run() {
    try {
        // 1. Get all tables
        const [tables] = await db.query('SHOW TABLES');
        const dbNameKey = Object.keys(tables[0])[0];
        const tableNames = tables.map(t => t[dbNameKey]);

        console.log(`Found ${tableNames.length} tables. Start adding primary keys and auto-increment...`);

        for (const tableName of tableNames) {
            if (tableName === '_migrations') continue;

            console.log(`Processing table: ${tableName}`);
            
            // Get columns to verify if id exists
            const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
            const hasId = columns.some(c => c.Field === 'id');

            if (!hasId) {
                console.log(`  🕒 Table ${tableName} has no 'id' column. Skipping.`);
                continue;
            }

            const idCol = columns.find(c => c.Field === 'id');
            const isPrimaryKey = idCol.Key === 'PRI';
            const isAutoIncrement = idCol.Extra.includes('auto_increment');

            if (isPrimaryKey && isAutoIncrement) {
                console.log(`  ✅ Table ${tableName} already has PRIMARY KEY and AUTO_INCREMENT on 'id'.`);
                continue;
            }

            // Step A: Add PRIMARY KEY if not already primary key
            if (!isPrimaryKey) {
                try {
                    await db.query(`ALTER TABLE \`${tableName}\` ADD PRIMARY KEY (\`id\`)`);
                    console.log(`  ✅ Added PRIMARY KEY constraint to ${tableName}.id`);
                } catch (err) {
                    console.log(`  🕒 Note (Primary Key): ${err.message}`);
                }
            }

            // Step B: Add AUTO_INCREMENT
            if (!isAutoIncrement) {
                try {
                    // We must modify it to be INT AUTO_INCREMENT
                    // First check what data type it is (usually int(11))
                    const dataType = idCol.Type;
                    await db.query(`ALTER TABLE \`${tableName}\` MODIFY \`id\` ${dataType} AUTO_INCREMENT`);
                    console.log(`  ✅ Enabled AUTO_INCREMENT on ${tableName}.id`);
                } catch (err) {
                    console.log(`  ❌ Failed to enable AUTO_INCREMENT on ${tableName}.id: ${err.message}`);
                }
            }
        }
        console.log('🎉 Finished processing all tables successfully!');
    } catch (e) {
        console.error('Fatal error running script:', e.message);
    } finally {
        process.exit(0);
    }
}

run();
