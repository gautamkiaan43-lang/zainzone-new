const db = require('../config/db');

async function test() {
    try {
        console.log('Querying project with ID 9...');
        const [rows] = await db.query('SELECT * FROM projects WHERE id = 9');
        console.log('Project Row 9:', JSON.stringify(rows[0], null, 2));
        
        console.log('Querying table structure (DESCRIBE)...');
        const [desc] = await db.query('DESCRIBE projects');
        console.log('Projects table fields:');
        console.table(desc);
        
        process.exit(0);
    } catch (e) {
        console.error('Error querying database:', e);
        process.exit(1);
    }
}

test();
