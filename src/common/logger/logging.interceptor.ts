/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new LoggerService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, headers } = request;
    const entryTime = Date.now();
    const requestType = 'HTTP';

    return next.handle().pipe(
      tap(() => {
        const exitTime = Date.now();
        const elapsedTime = exitTime - entryTime;
        this.logger.info(
          `Request: ${requestType} ${method} ${url} (Entry: ${entryTime}, Exit: ${exitTime}, Elapsed Time: ${elapsedTime}ms)`,
          LoggerService.name,
          { headers, params, query, body },
        );
      }),
      catchError((error) => {
        const exitTime = Date.now();
        const elapsedTime = exitTime - entryTime;
        this.logger.error(
          `Error occurred in Request: ${requestType} ${method} ${url} (Entry: ${entryTime}, Exit: ${exitTime}, Elapsed Time: ${elapsedTime}ms)`,
          error.stack,
          LoggerService.name,
          { headers, params, query, body },
        );

        return throwError(() => error);
      }),
    );
  }
}
