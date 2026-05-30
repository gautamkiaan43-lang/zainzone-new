const axios = require('axios');
async function run() {
    try {
        const res = await axios.post('http://localhost:5000/api/orders', {
            type: 'Marketplace Order',
            items: [{ name: 'Test Item', price: 10, qty: 1 }],
            order_kind: 'marketplace',
            delivery_mode: 'Road',
            total_amount: 10
        }, {
            headers: {
                Authorization: 'Bearer test' // This might fail auth, let's bypass auth or use valid token
            }
        });
        console.log(res.data);
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
}
run();
