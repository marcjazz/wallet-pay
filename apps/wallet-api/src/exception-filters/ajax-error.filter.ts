import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { AjaxError } from 'rxjs/ajax';

@Catch(AjaxError)
export class AjaxErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AjaxErrorFilter.name);

  catch(exception: AjaxError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.status;
    const error = exception.xhr.statusText;
    const errorMessage = exception.response?.error_message ?? exception.message;

    this.logger.error(`Ajax Request URL:
      method: ${exception.request.method}
      body: ${exception.request.body ?? 'none'}
      url: ${exception.request.url}
      response: ${errorMessage}
      error: ${error}
    `);

    response.status(status).json({
      error,
      statusCode: status,
      message: errorMessage,
    });
  }
}
