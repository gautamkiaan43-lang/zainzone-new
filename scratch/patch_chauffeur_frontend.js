const fs = require('fs');
const path = require('path');

const targetFile = 'C:\\Users\\kiaan\\OneDrive\\Desktop\\zaneion-new\\zanezon-frontend-latest(20-5-26)\\src\\pages\\Common\\Chauffeur.jsx';

if (!fs.existsSync(targetFile)) {
    console.error('File not found:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Patch the select onChange handler
// Let's use a regex to find the select onChange in Chauffeur.jsx
const selectReg = /name="driverNameSelect"[\s\S]*?onChange=\{\(e\) => \{([\s\S]*?)\}\}/;
const match = content.match(selectReg);

if (match) {
    const oldBody = match[1];
    // Check if we already patched it
    if (!oldBody.includes('driverUserId')) {
        const newBody = `\n                                                                     const input = e.target.form?.querySelector('input[name="driverName"]');\n                                                                     const hidden = e.target.form?.querySelector('input[name="driverUserId"]');\n                                                                     const selected = (users || []).find(u => u.name === e.target.value);\n                                                                     if (input && e.target.value) input.value = e.target.value;\n                                                                     if (hidden && selected) hidden.value = selected.id;\n                                                                 `;
        content = content.replace(oldBody, newBody);
        console.log('Successfully patched select onChange in Chauffeur.jsx');
    } else {
        console.log('Select onChange already patched.');
    }
} else {
    console.error('Could not find select onChange in Chauffeur.jsx');
    process.exit(1);
}

// 2. Patch the manual driver input to add the hidden input
const inputReg = /<input[\s\S]*?name="driverName"[\s\S]*?\/>/;
const inputMatch = content.match(inputReg);

if (inputMatch) {
    const matchedInput = inputMatch[0];
    if (!content.includes('name="driverUserId"')) {
        const patchedInput = matchedInput + '\n                                                             <input type="hidden" name="driverUserId" defaultValue={editingRequest?.driver_user_id || editingRequest?.driverId || \'\'} />';
        content = content.replace(matchedInput, patchedInput);
        console.log('Successfully added hidden driverUserId input to Chauffeur.jsx');
    } else {
        console.log('Hidden driverUserId input already exists.');
    }
} else {
    console.error('Could not find manual driver name input in Chauffeur.jsx');
    process.exit(1);
}

// 3. Let's patch the handleSubmit function!
// Let's find the request object inside handleSubmit
const requestReg = /const request = \{([\s\S]*?)\};/;
const requestMatch = content.match(requestReg);

if (requestMatch) {
    const oldRequestContent = requestMatch[1];
    if (!oldRequestContent.includes('driverUserIdVal')) {
        const newRequestContent = `
            clientId: isAdmin ? (selectedClientId || currentUser?.company_id || 'CLT-GUEST') : (currentUser?.clientId || currentUser?.company_id || 'CLT-GUEST'),
            clientName: isAdmin ? (selectedClient?.name || selectedClient?.business_name || currentUser?.name) : (currentUser?.name || 'Guest Client'),
            serviceType,
            requestDate: editingRequest ? editingRequest.requestDate : new Date().toISOString().split('T')[0],
            dueDate: formData.get('dueDate'),
            pickupTime: formData.get('pickupTime'),
            pickupLocation: formData.get('pickupLocation'),
            dropLocation: formData.get('dropLocation'),
            returnDate: serviceType === 'Round Trip' ? formData.get('returnDate') : null,
            returnTime: serviceType === 'Round Trip' ? formData.get('returnTime') : null,
            numberOfDays: serviceType === 'Daily Service' ? formData.get('numberOfDays') : null,
            numberOfPassengers: formData.get('numberOfPassengers') || 1,
            luggage: hasLuggage ? 'Yes' : 'No',
            bags: hasLuggage ? (parseInt(formData.get('bags'), 10) || 0) : 0,
            stops: hasStops ? 'Yes' : 'No',
            stopLocations: hasStops ? (formData.get('stopLocations') || '').trim() || null : null,
            amenities: amenities,
            chauffeurFee: normalizedFee,
            chauffeur_fee: normalizedFee,
            chauffeur_fee_mode: CHAUFFEUR_BILLING_MODE,
            driverName: isAdmin ? (formData.get('driverName') || null) : null,
            plateNumber: isAdmin ? (formData.get('plateNumber') || null) : null,
            driver_user_id: isAdmin ? (formData.get('driverUserId') ? Number(formData.get('driverUserId')) : (editingRequest?.driver_user_id || editingRequest?.driverId || null)) : (editingRequest?.driver_user_id || editingRequest?.driverId || null),
            passenger_info: isAdmin ? (() => {
                const driverUserIdVal = formData.get('driverUserId');
                const photo = (users || []).find(u => String(u.id) === String(driverUserIdVal))?.profile_pic_url || null;
                return {
                    ...(editingRequest?._passengerInfo || {}),
                    driver_user_id: driverUserIdVal ? Number(driverUserIdVal) : null,
                    driverPhotoUrl: photo,
                    adminApproved: true
                };
            })() : (editingRequest?.passenger_info || editingRequest?._passengerInfo || null),
            status: isAdmin ? (formData.get('driverName') ? 'assigned' : 'pending') : (editingRequest?.status || 'pending')
        `;
        content = content.replace(oldRequestContent, newRequestContent);
        console.log('Successfully patched handleSubmit request object in Chauffeur.jsx');
    } else {
        console.log('handleSubmit request object already patched.');
    }
} else {
    console.error('Could not find const request inside handleSubmit in Chauffeur.jsx');
    process.exit(1);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('All patches applied successfully!');
