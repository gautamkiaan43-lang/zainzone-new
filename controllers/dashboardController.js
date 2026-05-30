const db = require('../config/db');
const { companyFilter } = require('../middleware/company');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        const isSuperAdmin = ['super_admin', 'superadmin'].includes(String(req.user.role || '').toLowerCase());

        const cfAlias = (alias) => {
            if (isSuperAdmin) return { clause: '', params: [] };

            if (req.isCustomer) {
                if (alias === 'o') {
                    return { clause: ` AND ${alias}.created_by = ?`, params: [req.user.id] };
                }
                return { clause: ` AND 1=0`, params: [] };
            }

            if (req.companyScope === null || req.companyScope === undefined) {
                return { clause: '', params: [] };
            }

            if (alias === 'c') {
                // Companies table uses `id` as primary key, not `company_id`
                return { clause: ` AND ${alias}.id = ?`, params: [req.companyScope] };
            }
            // All other tables use `company_id`
            return { clause: ` AND ${alias}.company_id = ?`, params: [req.companyScope] };
        };

        const queries = [
            // 0: Total orders
            db.query(`SELECT COUNT(*) as count FROM orders o WHERE 1=1 ${cfAlias('o').clause}`, cfAlias('o').params),
            // 1: Total paid revenue
            db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM invoices i WHERE i.status = 'paid' ${cfAlias('i').clause}`, cfAlias('i').params),
            // 2: Active missions
            db.query(`SELECT COUNT(*) as count FROM missions m WHERE m.status IN ('pending','assigned','en_route') ${cfAlias('m').clause}`, cfAlias('m').params),
            // 3: Pending deliveries
            db.query(`SELECT COUNT(*) as count FROM deliveries d WHERE d.status = 'pending' ${cfAlias('d').clause}`, cfAlias('d').params),
            // 4: Total clients (companies)
            db.query(`SELECT COUNT(*) as count FROM companies c WHERE 1=1 ${cfAlias('c').clause}`, cfAlias('c').params),
            // 5: Total staff (users)
            db.query(`SELECT COUNT(*) as count FROM users u WHERE 1=1 ${cfAlias('u').clause}`, cfAlias('u').params),
            // 6: Low stock items
            db.query(`SELECT COUNT(*) as count FROM inventory inv WHERE inv.status = 'low_stock' ${cfAlias('inv').clause}`, cfAlias('inv').params),
            // 7: Active chauffeur requests
            db.query(`SELECT COUNT(*) as count FROM deliveries d WHERE d.mission_type = 'Chauffeur' AND d.status IN ('pending','assigned','en_route') ${cfAlias('d').clause}`, cfAlias('d').params),
            // 8: Active events
            db.query(`SELECT COUNT(*) as count FROM events e WHERE e.status IN ('planned','confirmed','in_progress') ${cfAlias('e').clause}`, cfAlias('e').params),
            // 9: Open support tickets
            db.query(`SELECT COUNT(*) as count FROM support_tickets st WHERE st.status IN ('open','in_progress') ${cfAlias('st').clause}`, cfAlias('st').params),
            // 10: Completed orders
            db.query(`SELECT COUNT(*) as count FROM orders o WHERE o.status = 'completed' ${cfAlias('o').clause}`, cfAlias('o').params),
            // 11: Total order value (non-cancelled)
            db.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders o WHERE o.status NOT IN ('cancelled') ${cfAlias('o').clause}`, cfAlias('o').params),
        ];

        const results = await Promise.all(queries);

        return successResponse(res, {
            totalOrders: results[0][0][0].count,
            totalRevenue: parseFloat(results[1][0][0].total),
            activeMissions: results[2][0][0].count,
            pendingDeliveries: results[3][0][0].count,
            totalClients: results[4][0][0].count,
            totalStaff: results[5][0][0].count,
            lowStockItems: results[6][0][0].count,
            activeChauffeurs: results[7][0][0].count,
            activeEvents: results[8][0][0].count,
            openTickets: results[9][0][0].count,
            completedOrders: results[10][0][0].count,
            totalOrderValue: parseFloat(results[11][0][0].total),
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        return errorResponse(res, 'Failed to fetch stats.', 500);
    }
};
