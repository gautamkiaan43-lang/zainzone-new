const fs = require('fs');
const path = require('path');

const targetFile = 'C:\\Users\\kiaan\\OneDrive\\Desktop\\zaneion-new\\zanezon-frontend-latest(20-5-26)\\src\\components\\OrderModal.jsx';

if (!fs.existsSync(targetFile)) {
    console.error('File not found:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add distanceHelper import at the top
const importLine = "import { useData } from '../context/GlobalDataContext';";
const newImport = "import { useData } from '../context/GlobalDataContext';\nimport { calculateOSRMRouteDistance } from '../utils/distanceHelper';";

if (content.includes(importLine) && !content.includes('calculateOSRMRouteDistance')) {
    content = content.replace(importLine, newImport);
    console.log('Added distanceHelper import to OrderModal.jsx');
}

// 2. Add totalDistance field to initial state
const defaultState = `        type: 'Custom Order',
        deliveryType: 'Road',
        pickupLocation: '',
        pickupTime: '',`;

const newState = `        type: 'Custom Order',
        deliveryType: 'Road',
        pickupLocation: '',
        pickupTime: '',
        totalDistance: '',`;

if (content.includes(defaultState) && !content.includes("totalDistance: '',")) {
    content = content.replace(defaultState, newState);
    console.log('Added totalDistance to default formData state');
}

// 3. Add pickupLocation and totalDistance to setFormData in useEffect [selectedOrder]
const editStateMatch = `                type: selectedOrder.type || 'Custom Order',
                deliveryType: selectedOrder.deliveryType || selectedOrder.mode || 'Road',
                pickupLocation: selectedOrder.pickupLocation || '',`;

const newEditState = `                type: selectedOrder.type || 'Custom Order',
                deliveryType: selectedOrder.deliveryType || selectedOrder.mode || 'Road',
                pickupLocation: selectedOrder.pickupLocation || selectedOrder.pickup_location || '',
                totalDistance: selectedOrder.totalDistance || selectedOrder.total_distance || '',`;

if (content.includes(editStateMatch)) {
    content = content.replace(editStateMatch, newEditState);
    console.log('Updated setFormData in useEffect to capture selectedOrder pickupLocation and totalDistance');
} else {
    // Attempt normalized match
    const editStateMatchNorm = editStateMatch.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    const normalizedContent = content.replace(/\r\n/g, '\n');
    console.log('Trying normalized match for selectedOrder useEffect...');
}

// 4. Add the useEffect to calculate route distance in the background
const hookInsertPoint = `    const handleAddItem = () => {`;
const newHook = `    useEffect(() => {
        const calculateDistance = async () => {
            if (formData.pickupLocation && formData.location) {
                const res = await calculateOSRMRouteDistance(formData.pickupLocation, formData.location);
                if (res && res.distanceKm != null) {
                    setFormData(prev => ({ ...prev, totalDistance: String(res.distanceKm) }));
                }
            }
        };
        const timer = setTimeout(() => {
            calculateDistance();
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData.pickupLocation, formData.location]);

    const handleAddItem = () => {`;

if (content.includes(hookInsertPoint) && !content.includes('calculateDistance')) {
    content = content.replace(hookInsertPoint, newHook);
    console.log('Added OSRM route distance useEffect hook to OrderModal.jsx');
}

// 5. Update the Destination field to render Pickup Location, Destination, and Total Distance (km)
const destinationMatch = `                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted uppercase">Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                    <input
                                        type="text"
                                        value={modalType === 'view' ? (selectedOrder?.location || '') : formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-accent outline-none"
                                        disabled={modalType === 'view'}
                                        placeholder="Enter destination"
                                    />
                                </div>
                            </div>`;

const newDestination = `                            {/* Pickup Location */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted uppercase">Pickup Location / Origin</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                    <input
                                        type="text"
                                        value={modalType === 'view' ? (selectedOrder?.pickupLocation || selectedOrder?.pickup_location || '') : formData.pickupLocation}
                                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-accent outline-none font-bold"
                                        disabled={modalType === 'view'}
                                        placeholder="Enter pickup location"
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted uppercase">Destination Address / Drop Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                    <input
                                        type="text"
                                        value={modalType === 'view' ? (selectedOrder?.location || '') : formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-accent outline-none font-bold"
                                        disabled={modalType === 'view'}
                                        placeholder="Enter destination"
                                    />
                                </div>
                            </div>

                            {/* Total Distance */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Total Distance (km)</label>
                                <input
                                    type="text"
                                    value={modalType === 'view' ? (selectedOrder?.totalDistance || selectedOrder?.total_distance || '') : formData.totalDistance}
                                    onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-accent font-black focus:border-accent outline-none"
                                    disabled={modalType === 'view'}
                                    placeholder="Distance auto-calculated..."
                                />
                            </div>`;

// Normalize content line endings for string replacements
const normContent = content.replace(/\r\n/g, '\n');
const normOldDest = destinationMatch.replace(/\r\n/g, '\n');
const normNewDest = newDestination.replace(/\r\n/g, '\n');

if (normContent.includes(normOldDest)) {
    const updatedContent = normContent.replace(normOldDest, normNewDest);
    fs.writeFileSync(targetFile, updatedContent, 'utf8');
    console.log('Successfully patched Destination fields in OrderModal.jsx');
} else {
    console.error('Could not find destination field match in OrderModal.jsx');
    process.exit(1);
}
