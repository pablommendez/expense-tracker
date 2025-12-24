/**
 * Express server configuration
 */

import express, { Express, json } from 'express';
import { requestLogger } from './shared/middleware/requestLogger.js';
import { correlationId } from './shared/middleware/correlationId.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { expenseRoutes } from './features/expenses/api/expenseRoutes.js';

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(json());
  app.use(correlationId);
  app.use(requestLogger);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/expenses', expenseRoutes);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
