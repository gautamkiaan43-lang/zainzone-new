const db = require('../config/db');

async function run() {
    try {
        console.log('Starting duplicate resolution and auto-increment enable...');

        // 1. Resolve notifications table duplicates
        console.log('Resolving notifications duplicates...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications_temp (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT,
                user_id INT,
                role_target VARCHAR(50),
                type VARCHAR(50) NOT NULL DEFAULT 'info',
                title VARCHAR(255) NOT NULL,
                message TEXT,
                link VARCHAR(255),
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        await db.query(`
            INSERT INTO notifications_temp (company_id, user_id, role_target, type, title, message, link, is_read, created_at)
            SELECT company_id, user_id, role_target, type, title, message, link, is_read, created_at FROM notifications;
        `);
        await db.query('DROP TABLE notifications;');
        await db.query('RENAME TABLE notifications_temp TO notifications;');
        console.log('  ✅ Notifications table successfully converted with unique auto-increment IDs!');

        // 2. Resolve deliveries table duplicates
        console.log('Resolving deliveries duplicates...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS deliveries_temp (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT,
                order_id INT,
                client_id INT,
                created_by INT,
                mission_type ENUM('Delivery','Pickup','Transfer','Chauffeur') DEFAULT 'Delivery',
                route VARCHAR(255),
                driver_name VARCHAR(255),
                plate_number VARCHAR(50),
                vehicle_id INT,
                assigned_driver INT,
                package_details LONGTEXT,
                pickup_location VARCHAR(255),
                drop_location VARCHAR(255),
                delivery_instructions TEXT,
                delivery_fee DECIMAL(10,2) DEFAULT 0.00,
                payout_status ENUM('none','held','released','disputed','cancelled') DEFAULT 'none',
                payout_ready_at TIMESTAMP NULL,
                passenger_info LONGTEXT,
                delivery_date DATE,
                pickup_time TIME,
                signature TEXT,
                status ENUM('pending','pending_review','assigned','en_route','delivered','completed','cancelled') DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        await db.query(`
            INSERT INTO deliveries_temp (
                company_id, order_id, client_id, created_by, mission_type, route, driver_name, plate_number,
                vehicle_id, assigned_driver, package_details, pickup_location, drop_location, delivery_instructions,
                delivery_fee, payout_status, payout_ready_at, passenger_info, delivery_date, pickup_time, signature,
                status, created_at, updated_at
            )
            SELECT 
                company_id, order_id, client_id, created_by, mission_type, route, driver_name, plate_number,
                vehicle_id, assigned_driver, package_details, pickup_location, drop_location, delivery_instructions,
                delivery_fee, payout_status, payout_ready_at, passenger_info, delivery_date, pickup_time, signature,
                status, created_at, updated_at 
            FROM deliveries;
        `);
        await db.query('DROP TABLE deliveries;');
        await db.query('RENAME TABLE deliveries_temp TO deliveries;');
        console.log('  ✅ Deliveries table successfully converted with unique auto-increment IDs!');

        console.log('🎉 Duplicates and auto-increment issues resolved successfully across all tables!');
    } catch (err) {
        console.error('❌ Error during duplicate resolution:', err.message);
    } finally {
        process.exit(0);
    }
}

run();
