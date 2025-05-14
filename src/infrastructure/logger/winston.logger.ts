import * as winston from 'winston';

// Create transports instance
const transports = [new winston.transports.Console()];

// Create and export the logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});
