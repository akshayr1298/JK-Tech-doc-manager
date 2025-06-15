import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let message = 'Internal server error';
    let errors = {};

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      if ('message' in errorResponse) {
        message = (errorResponse as any).message;
      }
      if ('errors' in errorResponse) {
        errors = (errorResponse as any).errors;
      } else if (Array.isArray(message)) {
        errors = { details: message };
        message = 'Validation failed';
      }
    } else if (typeof errorResponse === 'string') {
      message = errorResponse;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      errors: errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
