-- CreateEnum
CREATE TYPE "inventory_movements_type" AS ENUM ('entry', 'issue', 'loss', 'adjustment');

-- CreateEnum
CREATE TYPE "leave_requests_leave_type" AS ENUM ('vacation', 'sick', 'personal', 'bereavement');

-- CreateEnum
CREATE TYPE "saas_plans_billing_cycle" AS ENUM ('Monthly', 'Quarterly', 'Annually');

-- CreateEnum
CREATE TYPE "missions_mission_type" AS ENUM ('Delivery', 'Pickup', 'Transfer', 'Chauffeur', 'Custom');

-- CreateEnum
CREATE TYPE "audit_logs_status" AS ENUM ('pending', 'in_progress', 'completed', 'flagged');

-- CreateEnum
CREATE TYPE "deliveries_mission_type" AS ENUM ('Delivery', 'Pickup', 'Transfer', 'Chauffeur');

-- CreateEnum
CREATE TYPE "staff_assignments_status" AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "vehicles_vehicle_type" AS ENUM ('Van', 'Truck', 'Boat', 'Plane', 'Car', 'SUV');

-- CreateEnum
CREATE TYPE "luxury_items_status" AS ENUM ('Stored', 'In Use', 'Transferred', 'Returned');

-- CreateEnum
CREATE TYPE "staff_assignments_priority" AS ENUM ('Low', 'Normal', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "support_tickets_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "warehouses_status" AS ENUM ('active', 'inactive', 'maintenance');

-- CreateEnum
CREATE TYPE "events_status" AS ENUM ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "guest_requests_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "invoices_status" AS ENUM ('unpaid', 'partial', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "leave_requests_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "payroll_status" AS ENUM ('pending', 'processed', 'paid');

-- CreateEnum
CREATE TYPE "purchase_orders_status" AS ENUM ('Pending', 'Partially Received', 'Received', 'Cancelled');

-- CreateEnum
CREATE TYPE "quotes_status" AS ENUM ('Pending', 'Accepted', 'Rejected', 'Expired');

-- CreateEnum
CREATE TYPE "routes_type" AS ENUM ('Land', 'Sea', 'Air');

-- CreateEnum
CREATE TYPE "saas_plans_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "support_tickets_status" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('super_admin', 'admin', 'manager', 'operation', 'procurement', 'inventory', 'logistics', 'concierge', 'staff', 'customer', 'client', 'saas_client');

-- CreateEnum
CREATE TYPE "companies_billing_cycle" AS ENUM ('Monthly', 'Quarterly', 'Annually');

-- CreateEnum
CREATE TYPE "customers_client_type" AS ENUM ('Direct', 'SaaS', 'Enterprise', 'Individual');

-- CreateEnum
CREATE TYPE "guest_requests_status" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "missions_status" AS ENUM ('pending', 'assigned', 'en_route', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "routes_status" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "saas_requests_status" AS ENUM ('Pending', 'Approved', 'Provisioned', 'Rejected');

-- CreateEnum
CREATE TYPE "support_tickets_dispute_status" AS ENUM ('none', 'pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "vehicles_status" AS ENUM ('available', 'en_route', 'maintenance', 'decommissioned');

-- CreateEnum
CREATE TYPE "customers_status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "projects_status" AS ENUM ('planned', 'in_progress', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "purchase_requests_status" AS ENUM ('Pending', 'Approved', 'Rejected', 'Received', 'Cancelled', 'Ordered', 'Quotes Received', 'Partial Receipt', 'Completed');

-- CreateEnum
CREATE TYPE "users_employment_status" AS ENUM ('Full Time', 'Part Time', 'Probation', 'Inactive');

-- CreateEnum
CREATE TYPE "purchase_requests_priority" AS ENUM ('Low', 'Normal', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "inventory_inventory_type" AS ENUM ('Marketplace', 'Internal', 'Client');

-- CreateEnum
CREATE TYPE "vendors_status" AS ENUM ('active', 'inactive', 'blacklisted');

-- CreateEnum
CREATE TYPE "inventory_status" AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

-- CreateEnum
CREATE TYPE "orders_status" AS ENUM ('created', 'admin_review', 'concierge', 'operation', 'procurement', 'inventory', 'logistics', 'completed', 'cancelled', 'in_progress', 'delivered');

-- CreateEnum
CREATE TYPE "companies_client_type" AS ENUM ('SaaS', 'Personal', 'Business');

-- CreateEnum
CREATE TYPE "orders_current_stage" AS ENUM ('created', 'admin_review', 'concierge', 'operation', 'procurement', 'inventory', 'logistics', 'completed', 'in_progress');

-- CreateEnum
CREATE TYPE "companies_tenant_type" AS ENUM ('zanezion', 'saas', 'business', 'personal');

-- CreateEnum
CREATE TYPE "deliveries_payout_status" AS ENUM ('none', 'held', 'released', 'disputed', 'cancelled');

-- CreateEnum
CREATE TYPE "companies_status" AS ENUM ('active', 'pending', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "deliveries_status" AS ENUM ('pending', 'pending_review', 'assigned', 'en_route', 'delivered', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "users_status" AS ENUM ('pending', 'active', 'rejected', 'inactive');

-- CreateTable
CREATE TABLE "_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "ran_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "title" VARCHAR(255),
    "type" VARCHAR(100),
    "description" TEXT,
    "status" "audit_logs_status" DEFAULT 'pending',
    "performed_by" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "location" VARCHAR(255),
    "logo_url" VARCHAR(500),
    "tagline" VARCHAR(500),
    "plan" VARCHAR(100) DEFAULT 'Essentials',
    "billing_cycle" "companies_billing_cycle" DEFAULT 'Monthly',
    "payment_method" VARCHAR(100),
    "contact_person" VARCHAR(255),
    "contact" VARCHAR(255),
    "address" TEXT,
    "business_name" VARCHAR(255),
    "client_type" "companies_client_type" DEFAULT 'SaaS',
    "tenant_type" "companies_tenant_type" DEFAULT 'saas',
    "saas_fee_paid" BOOLEAN DEFAULT false,
    "source" VARCHAR(100),
    "created_by" INTEGER,
    "status" "companies_status" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "contact" VARCHAR(255),
    "address" TEXT,
    "client_type" "customers_client_type" DEFAULT 'Direct',
    "status" "customers_status" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "order_id" INTEGER,
    "client_id" INTEGER,
    "created_by" INTEGER,
    "mission_type" "deliveries_mission_type" DEFAULT 'Delivery',
    "route" VARCHAR(255),
    "driver_name" VARCHAR(255),
    "plate_number" VARCHAR(50),
    "vehicle_id" INTEGER,
    "assigned_driver" INTEGER,
    "package_details" TEXT,
    "pickup_location" VARCHAR(255),
    "drop_location" VARCHAR(255),
    "delivery_instructions" TEXT,
    "delivery_fee" DECIMAL(10,2) DEFAULT 0.00,
    "payout_status" "deliveries_payout_status" DEFAULT 'none',
    "payout_ready_at" TIMESTAMP(0),
    "passenger_info" TEXT,
    "delivery_date" DATE,
    "pickup_time" TIME(0),
    "signature" TEXT,
    "status" "deliveries_status" DEFAULT 'pending',
    "mode" VARCHAR(50) DEFAULT 'Road',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_pricing" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "tier_name" VARCHAR(255),
    "price" DECIMAL(12,2),
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "event_date" DATE,
    "location" VARCHAR(255),
    "client_id" INTEGER,
    "manager_id" INTEGER,
    "status" "events_status" DEFAULT 'planned',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_url" VARCHAR(500),
    "special_requests" TEXT,
    "planner_name" VARCHAR(255),
    "guest_count" INTEGER DEFAULT 0,
    "mood_board_url" VARCHAR(500),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_requests" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "client_id" INTEGER,
    "guest" VARCHAR(255),
    "requested_by" VARCHAR(255),
    "request_details" TEXT,
    "delivery_time" TIMESTAMP(0),
    "priority" "guest_requests_priority" DEFAULT 'medium',
    "status" "guest_requests_status" DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "category" VARCHAR(100),
    "quantity" INTEGER DEFAULT 0,
    "price" DECIMAL(12,2) DEFAULT 0.00,
    "threshold" INTEGER DEFAULT 10,
    "warehouse_id" INTEGER,
    "vendor_id" INTEGER,
    "client_id" INTEGER,
    "inventory_type" "inventory_inventory_type" DEFAULT 'Marketplace',
    "status" "inventory_status" DEFAULT 'in_stock',
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" VARCHAR(255),
    "color" VARCHAR(255),
    "material" VARCHAR(255),
    "specifications" TEXT,
    "description" TEXT,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "type" "inventory_movements_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference_type" VARCHAR(100),
    "reference_id" INTEGER,
    "reason" TEXT,
    "performed_by" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "order_id" INTEGER,
    "client_id" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) DEFAULT 0.00,
    "due_date" DATE,
    "status" "invoices_status" DEFAULT 'unpaid',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "leave_type" "leave_requests_leave_type" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "status" "leave_requests_status" DEFAULT 'pending',
    "reviewed_by" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistics_tracking" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "tracker_id" VARCHAR(100),
    "asset" VARCHAR(255),
    "location" VARCHAR(255),
    "signal_strength" VARCHAR(50) DEFAULT 'Strong',
    "eta" VARCHAR(100),
    "status" VARCHAR(100) DEFAULT 'Active',
    "delivery_id" INTEGER,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logistics_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistics_urgent_tasks" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "task" VARCHAR(255) NOT NULL,
    "time_label" VARCHAR(100) DEFAULT 'Immediate',
    "priority" VARCHAR(50) DEFAULT 'Critical',
    "location" VARCHAR(255),
    "assignee" VARCHAR(255) DEFAULT 'Pending',
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logistics_urgent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luxury_items" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "item_name" VARCHAR(255) NOT NULL,
    "owner_name" VARCHAR(255),
    "vault_location" VARCHAR(255),
    "estimated_value" DECIMAL(15,2),
    "status" "luxury_items_status" DEFAULT 'Stored',
    "notes" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luxury_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "role" VARCHAR(100) NOT NULL,
    "menu_name" VARCHAR(255) NOT NULL,
    "can_view" BOOLEAN DEFAULT true,
    "can_create" BOOLEAN DEFAULT false,
    "can_edit" BOOLEAN DEFAULT false,
    "can_delete" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "order_id" INTEGER,
    "project_id" INTEGER,
    "mission_type" "missions_mission_type" DEFAULT 'Delivery',
    "destination_type" VARCHAR(100),
    "assigned_driver" INTEGER,
    "vehicle_id" INTEGER,
    "status" "missions_status" DEFAULT 'pending',
    "event_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER,
    "role_target" VARCHAR(50),
    "type" VARCHAR(50) NOT NULL DEFAULT 'info',
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "link" VARCHAR(255),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_flow_logs" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "stage" VARCHAR(64),
    "assigned_to" INTEGER,
    "assigned_by" INTEGER,
    "status" VARCHAR(64),
    "notes" TEXT,
    "started_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(0),

    CONSTRAINT "order_flow_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "qty" INTEGER DEFAULT 1,
    "unit_price" DECIMAL(12,2) DEFAULT 0.00,
    "total_price" DECIMAL(12,2) DEFAULT 0.00,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "client_name" VARCHAR(255),
    "vendor_id" INTEGER,
    "created_by" INTEGER,
    "type" VARCHAR(100) DEFAULT 'Custom Order',
    "items" TEXT,
    "notes" TEXT,
    "delivery_instructions" TEXT,
    "location" VARCHAR(255),
    "delivery_address" VARCHAR(500),
    "total_amount" DECIMAL(12,2) DEFAULT 0.00,
    "status" "orders_status" DEFAULT 'created',
    "current_stage" "orders_current_stage" DEFAULT 'created',
    "assigned_to" INTEGER,
    "order_date" DATE,
    "due_date" DATE,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickup_location" VARCHAR(255),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP(0) NOT NULL,
    "used" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" VARCHAR(100),
    "transaction_id" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "payment_date" DATE,
    "gross_amount" DECIMAL(12,2),
    "deductions" DECIMAL(12,2) DEFAULT 0.00,
    "net_amount" DECIMAL(12,2),
    "status" "payroll_status" DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base_salary" DECIMAL(12,2) DEFAULT 0.00,
    "bonus" DECIMAL(12,2) DEFAULT 0.00,
    "nib_deduction" DECIMAL(12,2) DEFAULT 0.00,
    "medical_deduction" DECIMAL(12,2) DEFAULT 0.00,
    "pension_deduction" DECIMAL(12,2) DEFAULT 0.00,
    "savings_deduction" DECIMAL(12,2) DEFAULT 0.00,
    "birthday_club" DECIMAL(12,2) DEFAULT 0.00,
    "method" VARCHAR(100) DEFAULT 'Direct Deposit',

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "customer_id" INTEGER,
    "client_name" VARCHAR(255),
    "order_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "manager_id" INTEGER,
    "location" VARCHAR(255),
    "status" "projects_status" DEFAULT 'planned',
    "start_date" DATE,
    "end_date" DATE,
    "delivery_type" VARCHAR(50) DEFAULT 'Road',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "vendor_id" INTEGER NOT NULL,
    "items" TEXT,
    "total_amount" DECIMAL(12,2),
    "notes" TEXT,
    "payment_terms" VARCHAR(255) DEFAULT 'Net 30',
    "status" "purchase_orders_status" DEFAULT 'Pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "item_name" VARCHAR(255),
    "items" TEXT,
    "category" VARCHAR(100),
    "quantity" INTEGER,
    "estimated_cost" DECIMAL(12,2),
    "requester" VARCHAR(255),
    "requester_id" INTEGER,
    "status" "purchase_requests_status",
    "priority" "purchase_requests_priority" DEFAULT 'Normal',
    "notes" TEXT,
    "department" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "vendor_id" INTEGER NOT NULL,
    "purchase_request_id" INTEGER,
    "items" TEXT,
    "total_amount" DECIMAL(12,2),
    "validity_date" DATE,
    "status" "quotes_status" DEFAULT 'Pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "start_location" VARCHAR(255),
    "end_location" VARCHAR(255),
    "distance_km" DECIMAL(10,2),
    "estimated_time" VARCHAR(100),
    "type" "routes_type" DEFAULT 'Land',
    "status" "routes_status" DEFAULT 'Active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "billing_cycle" "saas_plans_billing_cycle" DEFAULT 'Monthly',
    "features" TEXT,
    "max_users" INTEGER DEFAULT 10,
    "max_orders" INTEGER DEFAULT 100,
    "status" "saas_plans_status" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_requests" (
    "id" SERIAL NOT NULL,
    "client_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "company_name" VARCHAR(255),
    "plan" VARCHAR(100),
    "contact_person" VARCHAR(255),
    "country" VARCHAR(100),
    "status" "saas_requests_status" DEFAULT 'Pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "clock_in" TIMESTAMP(0) NOT NULL,
    "clock_out" TIMESTAMP(0),
    "location" VARCHAR(255),
    "duration_hours" DECIMAL(6,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_assignments" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "assignee_id" INTEGER NOT NULL,
    "task" VARCHAR(500),
    "location" VARCHAR(255),
    "status" "staff_assignments_status" DEFAULT 'Pending',
    "priority" "staff_assignments_priority" DEFAULT 'Normal',
    "mission_type" VARCHAR(100),
    "passenger_name" VARCHAR(255),
    "pickup_time" TIMESTAMP(0),
    "drop_location" VARCHAR(255),
    "pickup_location" VARCHAR(255),
    "delivery_location" VARCHAR(255),
    "luggage" VARCHAR(255),
    "goods_details" TEXT,
    "weight" VARCHAR(50),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "subject" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) DEFAULT 'General',
    "description" TEXT,
    "messages" TEXT,
    "priority" "support_tickets_priority" DEFAULT 'medium',
    "status" "support_tickets_status" DEFAULT 'open',
    "dispute_status" "support_tickets_dispute_status" DEFAULT 'none',
    "refund_amount" DECIMAL(10,2) DEFAULT 0.00,
    "submitted_by" INTEGER,
    "assigned_to" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "setting_key" VARCHAR(255) NOT NULL,
    "setting_value" TEXT,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "created_by" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" "users_role" NOT NULL DEFAULT 'staff',
    "is_available" BOOLEAN DEFAULT true,
    "employment_status" "users_employment_status" DEFAULT 'Full Time',
    "birthday" DATE,
    "bank_name" VARCHAR(255),
    "account_number" VARCHAR(255),
    "routing_number" VARCHAR(255),
    "nib_number" VARCHAR(100),
    "vacation_balance" INTEGER DEFAULT 0,
    "passport_url" VARCHAR(500),
    "license_url" VARCHAR(500),
    "nib_doc_url" VARCHAR(500),
    "police_record_url" VARCHAR(500),
    "profile_pic_url" VARCHAR(500),
    "business_license_url" VARCHAR(500),
    "status" "users_status" DEFAULT 'active',
    "joined_date" DATE,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan" VARCHAR(100) DEFAULT 'Free',
    "is_upgraded" BOOLEAN DEFAULT false,
    "concierge_member" BOOLEAN DEFAULT false,
    "concierge_membership_since" DATE,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "plate_number" VARCHAR(50) NOT NULL,
    "model" VARCHAR(255),
    "type" VARCHAR(100),
    "vehicle_type" "vehicles_vehicle_type" DEFAULT 'Car',
    "capacity" VARCHAR(50),
    "fuel_level" INTEGER DEFAULT 100,
    "status" "vehicles_status" DEFAULT 'available',
    "insurance_policy" VARCHAR(255),
    "registration_expiry" DATE,
    "inspection_date" DATE,
    "diagnostic_status" VARCHAR(100),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "created_by" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "contact_name" VARCHAR(255),
    "category" VARCHAR(100),
    "location" VARCHAR(255),
    "rating" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "delivery" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "status" "vendors_status" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "capacity" INTEGER,
    "manager_id" INTEGER,
    "status" "warehouses_status" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "name" ON "_migrations"("name");
