import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createHmac } from 'crypto';
import { Request } from 'express';
import { CybridSubscriptionEventObjectDto } from './cybrid-subscription.dto';

@Injectable()
export class CybridSubscriptionsGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(CybridSubscriptionsGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();

    const ALGORITHM = 'sha256';
    const SIGNATURE_HEADER = 'X-Cybrid-Signature';
    const SIGNING_KEY = this.configService.get<string>('SIGNING_KEY');

    if (!SIGNING_KEY || !request.rawBody) {
      this.logger.error(
        `Missing signing key ${SIGNING_KEY} or invalid request raw body ${request.rawBody}`
      );
      return false;
    }

    const requestSignature = request.get(SIGNATURE_HEADER);
    const expectedSignature = createHmac(ALGORITHM, SIGNING_KEY)
      .update(request.rawBody)
      .digest('hex');

    const isRequestValid = requestSignature === expectedSignature;

    if (isRequestValid) {
      const isvalid = await this.validateRequestBody(request);
      if (isvalid) {
        this.logger.log(`Received payload ${request.body}`);
        return true;
      }
    }

    return false;
  }

  async validateRequestBody(request: Request) {
    const eventObject = plainToInstance(
      CybridSubscriptionEventObjectDto,
      request.body
    );
    try {
      const errors = await validate(eventObject);

      return (
        !errors.length &&
        eventObject.organization_guid ===
          this.configService.get('CYBRID_ORGANIZATION_ID') &&
        eventObject.sandbox ===
          (this.configService.get('NODE_ENV') !== 'production')
      );
    } catch (error) {
      this.logger.error(`Invalid subscription event object: ${error.message}`);
      return false;
    }
  }
}
