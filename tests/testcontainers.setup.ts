/**
 * Testcontainers setup for PostgreSQL integration tests
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let container: StartedPostgreSqlContainer | null = null;
let prisma: PrismaClient | null = null;

/**
 * Start PostgreSQL container and initialize Prisma
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  if (prisma) {
    return prisma;
  }

  // Start PostgreSQL container
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('expense_tracker_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const connectionString = container.getConnectionUri();

  // Set DATABASE_URL for Prisma
  process.env.DATABASE_URL = connectionString;

  // Run Prisma migrations
  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: connectionString },
    stdio: 'pipe',
  });

  // Create Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: { url: connectionString },
    },
  });

  await prisma.$connect();

  return prisma;
}

/**
 * Clean up database between tests
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.expense.deleteMany();
  }
}

/**
 * Teardown PostgreSQL container
 */
export async function teardownTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }

  if (container) {
    await container.stop();
    container = null;
  }
}

/**
 * Get test Prisma client
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return prisma;
}
