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
    const errorResponse = exception.getResponse(); // Get the original NestJS error object

    let message = 'Internal server error';
    let errors = {};

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      if ('message' in errorResponse) {
        message = (errorResponse as any).message;
      }
      if ('errors' in errorResponse) {
        // For validation errors
        errors = (errorResponse as any).errors;
      } else if (Array.isArray(message)) {
        // For class-validator array messages
        errors = { details: message };
        message = 'Validation failed'; // Generic message for validation errors
      }
    } else if (typeof errorResponse === 'string') {
      message = errorResponse;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      errors: errors, // Include detailed errors if available (e.g., from validation pipe)
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
