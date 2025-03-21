import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { AjaxError } from 'rxjs/ajax';

@Catch(AjaxError)
export class AjaxErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AjaxErrorFilter.name);

  catch(exception: AjaxError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.response.status;

    this.logger.error('Ajax Request URL:', {
      url: exception.request.url,
      body: exception.request.body,
      response: exception.response,
      headers: exception.request.headers,
    });

    response.status(status).json({
      statusCode: status,
      error: exception.response.status,
      message: exception.response.error_message,
    });
  }
}
