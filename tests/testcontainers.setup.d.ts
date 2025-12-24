/**
 * Testcontainers setup for PostgreSQL integration tests
 */
import { PrismaClient } from '@prisma/client';
/**
 * Start PostgreSQL container and initialize Prisma
 */
export declare function setupTestDatabase(): Promise<PrismaClient>;
/**
 * Clean up database between tests
 */
export declare function cleanupTestDatabase(): Promise<void>;
/**
 * Teardown PostgreSQL container
 */
export declare function teardownTestDatabase(): Promise<void>;
/**
 * Get test Prisma client
 */
export declare function getTestPrisma(): PrismaClient;
