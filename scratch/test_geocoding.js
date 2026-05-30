const https = require('https');

function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function geocodeWithFallback(query) {
    console.log('Geocoding query:', query);
    let result = await getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    if (result && result.length > 0) return result[0];

    const parts = query.split(/\s+/);
    if (parts.length > 2) {
        const last3 = parts.slice(-3).join(' ');
        console.log('Trying last 3 words:', last3);
        result = await getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(last3)}&limit=1`);
        if (result && result.length > 0) return result[0];

        const last2 = parts.slice(-2).join(' ');
        console.log('Trying last 2 words:', last2);
        result = await getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(last2)}&limit=1`);
        if (result && result.length > 0) return result[0];

        const last1 = parts.slice(-1).join(' ');
        console.log('Trying last 1 word:', last1);
        result = await getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(last1)}&limit=1`);
        if (result && result.length > 0) return result[0];
    }
    return null;
}

async function test() {
    const res = await geocodeWithFallback('mari mata indore');
    console.log('Final Result:', res);
}
test();
