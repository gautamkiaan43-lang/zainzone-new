process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Clean up existing data (optional)
  await prisma.delivery_pricing.deleteMany();
  await prisma.deliveries.deleteMany();
  await prisma.order_items.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.customers.deleteMany();
  await prisma.companies.deleteMany();
  await prisma.users.deleteMany();

  // Create a company
  const company = await prisma.companies.create({
    data: {
      name: "ZaneZion Luxury Concierge",
      email: "info@zanezion.com",
      phone: "+1-555-1234",
      location: "Dubai, UAE",
      tagline: "Luxury at your fingertips",
      plan: "Premium",
      billing_cycle: "Monthly",
      payment_method: "Credit Card",
      logo_url: "https://example.com/logo.png",
    },
  });

  // Create an admin user for the company
  const adminUser = await prisma.users.create({
    data: {
      company_id: company.id,
      name: "Admin User",
      email: "admin@zanezion.com",
      password: "$2a$10$adminhashedpasswordplaceholder", // assume already bcrypt‑hashed
      role: "super_admin",
      status: "active",
    },
  });

  // Seed some customers
  const customers = await prisma.customers.createMany({
    data: [
      { company_id: company.id, name: "John Doe", email: "john@example.com", phone: "+1-555-0001" },
      { company_id: company.id, name: "Jane Smith", email: "jane@example.com", phone: "+1-555-0002" },
    ],
  });

  // Seed inventory items
  const inventoryItems = await prisma.inventory.createMany({
    data: [
      { company_id: company.id, name: "Champagne", sku: "CHAMP-001", category: "Beverage", quantity: 100, price: 150.00 },
      { company_id: company.id, name: "Roses Bouquet", sku: "FLOW-001", category: "Floral", quantity: 50, price: 80.00 },
    ],
  });

  // Create an order with items
  const order = await prisma.orders.create({
    data: {
      company_id: company.id,
      customer_id: 1,
      type: "Custom Order",
      total_amount: 230.00,
      status: "created",
      current_stage: "created",
    },
  });

  await prisma.order_items.createMany({
    data: [
      { order_id: order.id, product_name: "Champagne", qty: 1, unit_price: 150.00, total_price: 150.00 },
      { order_id: order.id, product_name: "Roses Bouquet", qty: 1, unit_price: 80.00, total_price: 80.00 },
    ],
  });

  // Create a delivery linked to the order
  await prisma.deliveries.create({
    data: {
      company_id: company.id,
      order_id: order.id,
      client_id: 1,
      delivery_instructions: "Ring the bell and hand over to reception.",
      status: "pending",
      delivery_date: new Date(),
    },
  });

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
