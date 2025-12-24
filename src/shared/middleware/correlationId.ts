import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

/**
 * Middleware to ensure every request has a correlation ID
 * Uses X-Correlation-ID header if provided, otherwise generates a new UUID
 */
export function correlationId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id =
    (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID();

  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);

  next();
}
