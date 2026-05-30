const axios = require('axios');
async function testSupport() {
    try {
        // First login to get a token
        const loginRes = await axios.post('http://localhost:5000/auth/login', {
            email: 'admin@zanezion.com', // fallback to super admin
            password: 'password'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        // Now create a support ticket
        const ticketRes = await axios.post('http://localhost:5000/support/tickets', {
            subject: 'Test Ticket',
            category: 'General',
            description: 'This is a test ticket',
            priority: 'medium',
            messages: [{ sender: 'client', text: 'This is a test ticket' }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Ticket creation successful:', ticketRes.data);
    } catch (e) {
        console.error('Error creating ticket:', e.response?.data || e.message);
    }
}
testSupport();
