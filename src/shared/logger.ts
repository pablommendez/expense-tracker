import pino from 'pino';

/**
 * Pino logger instance with structured JSON output
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'expense-tracker',
    environment: process.env.NODE_ENV ?? 'development',
  },
});
