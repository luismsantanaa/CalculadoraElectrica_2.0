import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../interfaces/error.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as ErrorResponse;

    const error: ErrorResponse = {
      success: false,
      error: {
        code: errorResponse?.error?.code || 'HTTP_EXCEPTION',
        message: errorResponse?.error?.message || exception.message,
        details: errorResponse?.error?.details || null,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(error);
  }
}
