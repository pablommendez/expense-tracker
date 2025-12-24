/**
 * Expense Tracker API - Entry Point
 */

import { createServer } from './server.js';
import { logger } from './shared/logger.js';
import { setupSwagger } from './infrastructure/swagger.js';


const PORT = process.env.PORT ?? 3000;

async function main(): Promise<void> {
  const app = createServer();
  await setupSwagger(app);
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Expense Tracker API started');
  });
}

main().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
