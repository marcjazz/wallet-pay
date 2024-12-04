import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  NotImplementedException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { cybridConstants, cybridJobs } from '../constants';
import { CybridSubscriptionEventObjectDto } from './cybrid-subscription.dto';
import { CybridSubscriptionsGuard } from './cybrid-subscriptions.guard';

@ApiTags('Cybrid Subsciptions')
@Controller('cybrid-subscriptions')
@UseGuards(CybridSubscriptionsGuard)
export class CybridSubscriptionsController {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(cybridConstants.WEBHOOK_QUEUE)
    private cybridWebhookQueue: Queue
  ) {}

  @Post('handle')
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
        trade: cybridJobs.CYBRID_TRADE_EVENTS,
        transfer: cybridJobs.CYBRID_TRANSFER_EVENTS,
        identity_verification: cybridJobs.CYBRID_IDENTITY_VERIFICATION_EVENTS,
      };
      const event = eventTypeMap[eventType];

      if (event) {
        this.cybridWebhookQueue.add(event, eventObject, {
          attempts: 3,
          backoff: 5000,
        });
      } else
        throw new NotImplementedException(
          `Event type not implemented yet ${eventType}`
        );
    }

    resp.status(200).send('OK');
  }
}
