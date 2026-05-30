import { PrismaClientOptions } from '@prisma/client';

const prismaConfig: PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export default prismaConfig;
