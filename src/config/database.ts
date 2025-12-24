import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton
 * Use this for all database operations
 */
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

/**
 * Graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
