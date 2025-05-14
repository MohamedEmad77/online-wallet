/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsoleLogger, ConsoleLoggerOptions } from '@nestjs/common';
import { logger } from '@/infrastructure/logger/winston.logger';

export class LoggerService extends ConsoleLogger {
  protected context?: string;
  protected options: ConsoleLoggerOptions;
  protected logger = logger;
  info(message: string, context?: string, params: object = {}) {
    this.logger.info(message, { context, ...params, service: this.context });
  }

  warning(message: string, context?: string, params: object = {}) {
    this.logger.warn(message, { context, ...params, service: this.context });
  }

  log(message: any, context?: string, params: object = {}) {
    this.logger.info(message, { context, ...params, service: this.context });
  }

  error(message: any, stack?: string, context?: string, params: object = {}) {
    this.logger.error(message, {
      context,
      stack,
      service: this.context,
      ...params,
    });
  }
}
