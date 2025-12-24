import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/DomainError.js';
import { ValidationError, ValidationErrors } from '../errors/ValidationError.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { logger } from '../logger.js';

/**
 * Global error handler middleware
 * Maps Result<T> errors and exceptions to HTTP responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.correlationId ?? 'unknown';

  // Handle ValidationErrors (array)
  if (error instanceof ValidationErrors) {
    logger.warn({ error: error.toJSON(), correlationId }, 'Validation errors');
    res.status(400).json({
      error: 'Validation failed',
      details: error.toJSON(),
    });
    return;
  }

  // Handle single ValidationError
  if (error instanceof ValidationError) {
    logger.warn({ error: error.toJSON(), correlationId }, 'Validation error');
    res.status(400).json({
      error: 'Validation failed',
      details: [error.toJSON()],
    });
    return;
  }

  // Not found -> 404
  if (error instanceof NotFoundError) {
    logger.info({ error: error.toJSON(), correlationId }, 'Resource not found');
    res.status(404).json({
      error: 'Resource not found',
      details: error.toJSON(),
    });
    return;
  }

  // Domain errors (general) -> 400
  if (error instanceof DomainError) {
    logger.warn({ error: error.toJSON(), correlationId }, 'Domain error');
    res.status(400).json({
      error: 'Bad request',
      details: error.toJSON(),
    });
    return;
  }

  // Unexpected errors -> 500
  logger.error({ error, correlationId, stack: error.stack }, 'Unexpected error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message,
  });
}
