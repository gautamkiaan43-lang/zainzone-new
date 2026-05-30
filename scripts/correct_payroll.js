const db = require('../config/db');

async function run() {
    console.log('Updating payroll record ID 2 to set correct values...');
    await db.query(`
        UPDATE payroll 
        SET nib_deduction = 0.00,
            medical_deduction = 0.00,
            pension_deduction = 0.00,
            savings_deduction = 0.00,
            birthday_club = 0.00,
            net_amount = 150.00,
            status = 'processed'
        WHERE id = 2
    `);
    console.log('Successfully corrected payroll record.');
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
