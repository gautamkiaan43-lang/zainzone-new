const ctrl = require('./controllers/orderController');
const res = {
    status: (code) => ({
        json: (data) => console.log('RESPONSE:', code, data)
    })
};
const req = {
    user: { id: 1, role: 'customer', email: 'test@test.com' },
    body: {
        items: [{ name: null, price: 10, qty: 1 }],
        type: 'Marketplace Order',
        order_kind: 'marketplace',
        delivery_mode: 'Road',
        total_amount: 10
    }
};

ctrl.create(req, res).catch(console.error).finally(() => setTimeout(() => process.exit(), 1000));
