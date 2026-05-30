const db = require('../config/db');
const orderController = require('../controllers/orderController');

// Mock request and response to test orderController.update
async function test() {
    try {
        const req = {
            params: { id: '5' },
            body: {
                location: 'updated drop location',
                items: [{ name: 'sdfg', qty: 2, price: 150 }],
                total: 300,
                status: 'operation'
            },
            user: {
                id: 1,
                role: 'admin',
                company_id: 1
            },
            companyScope: 1
        };

        const res = {
            statusCode: 200,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                console.log('Response JSON:', data);
            }
        };

        await orderController.update(req, res);

        // Verify database state
        const [rows] = await db.query('SELECT id, items, location, total_amount, status FROM orders WHERE id = 5');
        console.log('Database row after update:', rows[0]);
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        process.exit(0);
    }
}

test();
