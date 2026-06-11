import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log('Clients:', clients.map(c => ({
    id: c.id,
    name: c.companyName,
    clientType: c.clientType,
    tenantType: c.tenantType
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
