const fs = require('fs');

const targetFile = 'C:\\Users\\kiaan\\OneDrive\\Desktop\\zaneion-new\\zanezob-bacedn-latest(20-5-26)\\controllers\\logisticsController.js';

if (!fs.existsSync(targetFile)) {
    console.error('File not found:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Replace all occurrences of u.name as driver_name, with COALESCE(u.name, d.driver_name) as driver_name,
const oldStr = 'u.name as driver_name,';
const newStr = 'COALESCE(u.name, d.driver_name) as driver_name,';

if (!content.includes(oldStr)) {
    console.log('Already patched or not found.');
} else {
    // Replace all occurrences
    content = content.split(oldStr).join(newStr);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched logisticsController.js with COALESCE!');
}
