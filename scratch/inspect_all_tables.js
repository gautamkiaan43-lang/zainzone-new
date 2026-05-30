const db = require('../config/db');

async function inspect() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        const dbName = Object.keys(tables[0])[0];
        
        for (const row of tables) {
            const tableName = row[dbName];
            console.log(`\nTable: ${tableName}`);
            const [columns] = await db.query(`DESCRIBE \`${tableName}\``);
            
            const pkCol = columns.find(c => c.Key === 'PRI');
            const autoIncCol = columns.find(c => c.Extra.includes('auto_increment'));
            
            console.log(`  Columns: ${columns.length}`);
            console.log(`  Primary Key: ${pkCol ? pkCol.Field : 'NONE'}`);
            console.log(`  Auto Increment: ${autoIncCol ? autoIncCol.Field : 'NONE'}`);
            
            if (!pkCol || !autoIncCol) {
                console.log('  ⚠️ MISSING PK OR AUTO_INCREMENT');
            }
        }
    } catch (e) {
        console.error('ERR:', e);
    } finally {
        process.exit(0);
    }
}

inspect();
