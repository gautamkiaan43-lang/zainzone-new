const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const count = await prisma.companies.count();
    console.log('Companies count:', count);
    const first = await prisma.companies.findFirst();
    console.log('First company:', first);
  } catch (e) {
    console.error('Error during Prisma query:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
