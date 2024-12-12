import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = request['traceId'];

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // Handle validation errors (BadRequestException with validation details)
      if (exception instanceof BadRequestException && typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        message = response.message || exception.message;
        if (Array.isArray(response.message)) {
          errors = response.message;
          message = 'Validation failed';
        }
      } else {
        message = exception.message;
      }
    }

    // Log the error with trace ID
    this.logger.error({
      message: exception.message,
      traceId,
      stack: exception.stack,
      path: request.url,
      method: request.method,
    });

    // Build error response
    const errorResponse: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include trace ID for all errors
    errorResponse.traceId = traceId;

    // Include validation errors for 4xx
    if (status < 500 && errors) {
      errorResponse.errors = errors;
    }

    response.status(status).json(errorResponse);
  }
}
