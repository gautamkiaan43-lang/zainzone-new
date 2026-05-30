const fs = require('fs');

const targetFile = 'C:\\Users\\kiaan\\OneDrive\\Desktop\\zaneion-new\\zanezon-frontend-latest(20-5-26)\\src\\pages\\Client\\ClientStore.jsx';

if (!fs.existsSync(targetFile)) {
    console.error('File not found:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add distanceHelper import at the top
const importLine = "import { normalizeRole } from '../../utils/authUtils';";
const newImport = "import { normalizeRole } from '../../utils/authUtils';\nimport { calculateOSRMRouteDistance } from '../../utils/distanceHelper';";

if (content.includes(importLine) && !content.includes('calculateOSRMRouteDistance')) {
    content = content.replace(importLine, newImport);
    console.log('Added distanceHelper import to ClientStore.jsx');
}

// 2. Add state variables below line 57
const stateInsertBefore = "    React.useEffect(() => {\n        fetchInventory();";
const stateVars = `    // Distance/Routing state variables
    const [catalogPickupAddress, setCatalogPickupAddress] = useState('');
    const [catalogDistanceKm, setCatalogDistanceKm] = useState('');
    const [customPickupAddress, setCustomPickupAddress] = useState('');
    const [customDistanceKm, setCustomDistanceKm] = useState('');
    const [personalPickupAddress, setPersonalPickupAddress] = useState('');
    const [personalDropAddress, setPersonalDropAddress] = useState('');

    // useEffect for Catalog/Marketplace Checkout OSRM Route distance
    React.useEffect(() => {
        const calculateDistance = async () => {
            if (catalogPickupAddress && catalogDeliveryAddress) {
                const res = await calculateOSRMRouteDistance(catalogPickupAddress, catalogDeliveryAddress);
                if (res && res.distanceKm != null) {
                    setCatalogDistanceKm(String(res.distanceKm));
                }
            }
        };
        const timer = setTimeout(() => {
            calculateDistance();
        }, 1000);
        return () => clearTimeout(timer);
    }, [catalogPickupAddress, catalogDeliveryAddress]);

    // useEffect for Custom Requests (B2B/Business portfolio) OSRM Route distance
    React.useEffect(() => {
        const calculateDistance = async () => {
            if (customPickupAddress && destination) {
                const res = await calculateOSRMRouteDistance(customPickupAddress, destination);
                if (res && res.distanceKm != null) {
                    setCustomDistanceKm(String(res.distanceKm));
                }
            }
        };
        const timer = setTimeout(() => {
            calculateDistance();
        }, 1000);
        return () => clearTimeout(timer);
    }, [customPickupAddress, destination]);

    // useEffect for Personal Custom Requests (customer pickup/delivery) OSRM Route distance
    React.useEffect(() => {
        const calculateDistance = async () => {
            if (personalPickupAddress && personalDropAddress) {
                const res = await calculateOSRMRouteDistance(personalPickupAddress, personalDropAddress);
                if (res && res.distanceKm != null) {
                    setCustomRequestDistanceKm(String(res.distanceKm));
                }
            }
        };
        const timer = setTimeout(() => {
            calculateDistance();
        }, 1000);
        return () => clearTimeout(timer);
    }, [personalPickupAddress, personalDropAddress]);\n\n`;

if (content.includes(stateInsertBefore) && !content.includes('catalogPickupAddress')) {
    content = content.replace(stateInsertBefore, stateVars + stateInsertBefore);
    console.log('Added state variables and distance hooks to ClientStore.jsx');
}

// 3. Update Personal Custom Requests inputs
const oldPersonalInputs = `                                {(customRequestSubtype === 'document_pickup_delivery' || customRequestSubtype === 'package_pickup_delivery') && (
                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest">Estimated distance (km)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            inputMode="decimal"
                                            value={customRequestDistanceKm}
                                            onChange={(e) => setCustomRequestDistanceKm(e.target.value)}
                                            placeholder="e.g. 12"
                                            className="w-full max-w-xs bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold"
                                        />`;

const newPersonalInputs = `                                {(customRequestSubtype === 'document_pickup_delivery' || customRequestSubtype === 'package_pickup_delivery') && (
                                    <div className="space-y-4 pt-2 border-t border-white/10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Pickup Location / Origin Address</label>
                                            <input
                                                type="text"
                                                placeholder="Enter pickup address..."
                                                value={personalPickupAddress}
                                                onChange={(e) => setPersonalPickupAddress(e.target.value)}
                                                className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Destination Address / Drop Location</label>
                                            <input
                                                type="text"
                                                placeholder="Enter drop address..."
                                                value={personalDropAddress}
                                                onChange={(e) => setPersonalDropAddress(e.target.value)}
                                                className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Estimated distance (km)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                inputMode="decimal"
                                                value={customRequestDistanceKm}
                                                onChange={(e) => setCustomRequestDistanceKm(e.target.value)}
                                                placeholder="e.g. 12"
                                                className="w-full max-w-xs bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold"
                                            />
                                        </div>`;

// Line endings normalized for comparison
const normContent = content.replace(/\r\n/g, '\n');
const normOldPersonal = oldPersonalInputs.replace(/\r\n/g, '\n');
const normNewPersonal = newPersonalInputs.replace(/\r\n/g, '\n');

if (normContent.includes(normOldPersonal)) {
    content = normContent.replace(normOldPersonal, normNewPersonal);
    console.log('Successfully updated personal custom request inputs');
} else {
    console.log('Searching for alternative pattern in personal custom request...');
}

// 4. Update B2B Custom Request Destination inputs
const oldB2BDestination = `                        <div className="flex-1 max-w-md space-y-4">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Destination Address / Port</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter secure drop location..."
                                    className="w-full bg-background border border-white/10 rounded-3xl pl-12 pr-4 py-4 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all shadow-inner"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>`;

const newB2BDestination = `                        <div className="flex-1 max-w-md space-y-4">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Pickup Location / Origin Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter secure origin/pickup..."
                                    className="w-full bg-background border border-white/10 rounded-3xl pl-12 pr-4 py-4 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all shadow-inner"
                                    value={customPickupAddress}
                                    onChange={(e) => setCustomPickupAddress(e.target.value)}
                                />
                            </div>
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Destination Address / Port</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter secure drop location..."
                                    className="w-full bg-background border border-white/10 rounded-3xl pl-12 pr-4 py-4 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all shadow-inner"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Total Distance (km)</label>
                                <input
                                    type="text"
                                    placeholder="Distance auto-calculated..."
                                    className="w-full bg-background border border-white/10 rounded-3xl px-4 py-4 text-sm text-accent focus:border-accent/50 outline-none font-black transition-all shadow-inner"
                                    value={customDistanceKm}
                                    onChange={(e) => setCustomDistanceKm(e.target.value)}
                                />
                            </div>`;

const normContent2 = content.replace(/\r\n/g, '\n');
const normOldB2B = oldB2BDestination.replace(/\r\n/g, '\n');
const normNewB2B = newB2BDestination.replace(/\r\n/g, '\n');

if (normContent2.includes(normOldB2B)) {
    content = normContent2.replace(normOldB2B, normNewB2B);
    console.log('Successfully updated B2B custom request destination inputs');
}

// 5. Update Catalog Delivery address block to render Pickup Location, Destination and Total Distance (km)
const oldCatalogDelivery = `                                    {/* Delivery address required for catalog orders */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MapPin size={12} /> Delivery Address *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter delivery address..."
                                            value={catalogDeliveryAddress}
                                            onChange={(e) => setCatalogDeliveryAddress(e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all placeholder:text-muted/40"
                                        />
                                    </div>`;

const newCatalogDelivery = `                                    {/* Delivery address required for catalog orders */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MapPin size={12} /> Pickup Location / Origin Address
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter pickup/origin address..."
                                            value={catalogPickupAddress}
                                            onChange={(e) => setCatalogPickupAddress(e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all placeholder:text-muted/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MapPin size={12} /> Delivery Address *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter delivery address..."
                                            value={catalogDeliveryAddress}
                                            onChange={(e) => setCatalogDeliveryAddress(e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent/50 outline-none font-bold transition-all placeholder:text-muted/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MapPin size={12} /> Total Distance (km)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Distance auto-calculated..."
                                            value={catalogDistanceKm}
                                            onChange={(e) => setCatalogDistanceKm(e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-3 text-sm text-accent focus:border-accent/50 outline-none font-black transition-all"
                                        />
                                    </div>`;

const normContent3 = content.replace(/\r\n/g, '\n');
const normOldCatalog = oldCatalogDelivery.replace(/\r\n/g, '\n');
const normNewCatalog = newCatalogDelivery.replace(/\r\n/g, '\n');

if (normContent3.includes(normOldCatalog)) {
    content = normContent3.replace(normOldCatalog, normNewCatalog);
    console.log('Successfully updated Catalog delivery/pickup/distance inputs');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('ClientStore.jsx patch operation completed successfully!');
