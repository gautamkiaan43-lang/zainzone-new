async function run() {
    try {
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA2LCJyb2xlIjoiY3VzdG9tZXIiLCJlbWFpbCI6ImN1c3RvbWVyMUBleGFtcGxlLmNvbSIsImlhdCI6MTc3OTI2MDE0NSwiZXhwIjoxNzc5MjYzNzQ1fQ.loRqk1cFQRRmguK6OcRCeUxLAaW2ekMt1hBLq45hRos`
            },
            body: JSON.stringify({
                clientId: 1,
                items: [{ name: 'Test', qty: 1, price: 10, custom: true }],
                orderDate: new Date().toISOString(),
                deliveryAddress: 'Test Addr',
                notes: 'Test Notes',
                status: 'pending_review',
                order_kind: 'marketplace',
                type: 'Marketplace Order',
                companyId: 1,
            })
        });
        const data = await res.json();
        console.log('STATUS:', res.status);
        console.log('RESPONSE:', data);
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
run();
