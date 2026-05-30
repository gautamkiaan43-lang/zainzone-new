const db = require('../config/db');

async function run() {
    const [rows] = await db.query(`
        SELECT d.*, 
               d.assigned_driver as driverId,
               COALESCE(u.name, d.driver_name) as driver_name,
               u.profile_pic_url as driver_profile_url
        FROM deliveries d
        LEFT JOIN users u ON d.assigned_driver = u.id
        WHERE d.id = 36
    `);
    const d = rows[0];
    console.log('Database row:', d);
    
    // Simulate frontend normalization
    const normalized = {
      id: `DEL-${String(d.id).padStart(3, '0')}`,
      db_id: d.id,
      driverId: d.assigned_driver ?? d.driver_id ?? d.assigned_to ?? null,
      driver: d.driver_name,
      status: d.status,
      mission_type: d.mission_type,
    };
    console.log('Normalized frontend object:', normalized);
    
    // Check if mine
    const currentUserId = 97;
    const currentUserName = "field staff";
    const isMine =
        (normalized.driverId && String(normalized.driverId) === String(currentUserId)) ||
        (normalized.driver === currentUserName);
    const isLogisticsMission = String(normalized.mission_type || '').toLowerCase() !== 'chauffeur';
    
    console.log('isMine:', isMine);
    console.log('isLogisticsMission:', isLogisticsMission);
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
