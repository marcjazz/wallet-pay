import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Response } from 'express';
import { SkipAuth } from '../../app/auth/auth.decorator';
import { constants } from '../../constants';
import { PrismaService } from '../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from './dtos/cybrid-subscription.dto';
import { CybridSubscriptionsGuard } from './guards/cybrid-subscriptions.guard';

@SkipAuth()
@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(constants.WEBHOOK_QUEUE)
    private webhooksQueue: Queue
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('cybrid-subscriptions')
  @UseGuards(CybridSubscriptionsGuard)
  @ApiOperation({ summary: 'Cybrid subscription events handler. ' })
  async handleSubscriptionEvents(
    @Res() resp: Response,
    @Body() eventObject: CybridSubscriptionEventObjectDto
  ) {
    const event = await this.prismaService.cybridSubscriptionEvent.findUnique({
      where: { event_guid: eventObject.guid },
    });
    if (!event) {
      const [eventType] = eventObject.event_type.split('.');

      const eventTypeMap: Record<string, string> = {
        trade: constants.CYBRID_TRADE_EVENTS,
        transfer: constants.CYBRID_TRANSFER_EVENTS,
        identity_verification: constants.CYBRID_IDENTITY_VERIFICATION_EVENTS,
      };
      const event = eventTypeMap[eventType];

      if (event) {
        this.webhooksQueue.add(event, eventObject, {
          attempts: 3,
          backoff: 5000,
        });
      } else
        throw new NotImplementedException(
          `Event type not implemented yet ${eventType}`
        );
    }

    resp.status(HttpStatus.OK).send('OK');
  }
}
