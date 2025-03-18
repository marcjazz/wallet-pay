import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.status || 500;

    console.log('Exception:', exception);

    this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.xhr
        ? exception.response?.error_message
        : exception.message,
      path: request.url,
    });
  }
}
