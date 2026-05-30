const db = require('./config/db');

async function run() {
    try {
        console.log('Altering customers table: making name column nullable...');
        await db.query(`
            ALTER TABLE customers
            MODIFY COLUMN name VARCHAR(255) NULL
        `);
        console.log('✅ Successfully modified name column to be nullable!');
    } catch (err) {
        console.error('❌ Error modifying name column:', err.message);
    }
    process.exit(0);
}

run();
