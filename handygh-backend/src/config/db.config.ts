import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dbConfig = {
  client: prisma,
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/handygh',
};

export default dbConfig;