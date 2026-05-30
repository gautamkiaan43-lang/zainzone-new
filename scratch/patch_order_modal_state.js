const fs = require('fs');

const targetFile = 'C:\\Users\\kiaan\\OneDrive\\Desktop\\zaneion-new\\zanezon-frontend-latest(20-5-26)\\src\\components\\OrderModal.jsx';

if (!fs.existsSync(targetFile)) {
    console.error('File not found:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add totalDistance: '' to default state
const oldDefaultState = `        pickupLocation: '',
        pickupTime: '',
        serviceType: 'One Way',`;

const newDefaultState = `        pickupLocation: '',
        pickupTime: '',
        totalDistance: '',
        serviceType: 'One Way',`;

if (content.includes(oldDefaultState)) {
    content = content.replace(oldDefaultState, newDefaultState);
    console.log('Added totalDistance to default state.');
}

// 2. Add totalDistance to selectedOrder useEffect state mapping
const oldSelectedMap = `                pickupLocation: selectedOrder.pickupLocation || '',
                pickupTime: selectedOrder.pickupTime || '',`;

const newSelectedMap = `                pickupLocation: selectedOrder.pickupLocation || selectedOrder.pickup_location || '',
                pickupTime: selectedOrder.pickupTime || '',
                totalDistance: selectedOrder.totalDistance || selectedOrder.total_distance || '',`;

if (content.includes(oldSelectedMap)) {
    content = content.replace(oldSelectedMap, newSelectedMap);
    console.log('Added totalDistance to selectedOrder state mapping.');
} else {
    // Let's do a fallback replace if lines are different
    console.log('Checking alternative for selectedOrder...');
    const altMap = `                pickupLocation: selectedOrder.pickupLocation || '',`;
    const altNewMap = `                pickupLocation: selectedOrder.pickupLocation || selectedOrder.pickup_location || '',
                totalDistance: selectedOrder.totalDistance || selectedOrder.total_distance || '',`;
    if (content.includes(altMap)) {
        content = content.replace(altMap, altNewMap);
        console.log('Successfully applied fallback selectedOrder state mapping.');
    }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('OrderModal state patching completed.');
