import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

/**
 * Middleware to log HTTP requests with correlation ID and latency
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Log request
  logger.info(
    {
      correlationId: req.correlationId,
      operationName: `${req.method} ${req.path}`,
      method: req.method,
      path: req.path,
      query: req.query,
    },
    'Inbound HTTP request'
  );

  // Log response on finish
  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;

    logger.info(
      {
        correlationId: req.correlationId,
        operationName: `${req.method} ${req.path}`,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        latencyMs,
        outcome: res.statusCode < 400 ? 'success' : 'failure',
      },
      'Outbound HTTP response'
    );
  });

  next();
}
