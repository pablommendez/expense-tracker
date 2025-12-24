/**
 * Expense Tracker API - Entry Point
 */

import { createServer } from './server.js';
import { logger } from './shared/logger.js';

const PORT = process.env.PORT ?? 3000;

async function main(): Promise<void> {
  const app = createServer();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Expense Tracker API started');
  });
}

main().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
