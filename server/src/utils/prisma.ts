import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export default prisma;
