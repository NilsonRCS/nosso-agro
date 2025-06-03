import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userAgent = request.get('User-Agent') || '';
    const { ip, method, originalUrl: url } = request;

    const startTime = Date.now();
    const requestId = this.generateRequestId();
    this.logger.log({
      message: 'HTTP Request Started',
      requestId,
      method,
      url,
      ip,
      userAgent,
      body:
        method !== 'GET'
          ? this.sanitizeBody(request.body as Record<string, unknown>)
          : undefined,
      query: Object.keys(request.query).length > 0 ? request.query : undefined,
    });

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log({
            message: 'HTTP Request Completed',
            requestId,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            responseSize: this.getResponseSize(responseBody),
          });
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;
          this.logger.error({
            message: 'HTTP Request Failed',
            requestId,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private sanitizeBody(
    body: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!body) return undefined;

    const sanitized = { ...body };

    const sensitiveFields = ['password', 'token', 'authorization', 'secret'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private getResponseSize(responseBody: unknown): string {
    if (!responseBody) return '0B';

    const size = JSON.stringify(responseBody).length;
    if (size < 1024) return `${size}B`;
    return `${(size / 1024).toFixed(2)}KB`;
  }
}
