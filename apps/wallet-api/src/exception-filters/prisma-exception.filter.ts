import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

export type PrismaException =
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientValidationError;

@Catch(
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const message = exception.message;
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code.startsWith('P2')) {
        httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      }
    }

    const { httpAdapter } = this.httpAdapterHost;

    const responseBody = {
      statusCode: httpStatus,
      message: message.substring(message.lastIndexOf('\n')),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
