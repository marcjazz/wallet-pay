import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  NotImplementedException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { cybridConstants, cybridJobs } from '../constants';
import { CybridSubscriptionEventObjectDto } from './cybrid-subscription.dto';
import { Response } from 'express';
import { CybridSubscriptionsGuard } from './cybrid-subscriptions.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('cybrid-subscriptions')
@UseGuards(CybridSubscriptionsGuard)
export class CybridSubscriptionsController {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(cybridConstants.QUEUE)
    private cybridQueue: Queue
  ) {}

  @Post('handle')
  async handleIdentityVerificationEvent(
    @Res() resp: Response,
    @Body() eventObject: CybridSubscriptionEventObjectDto
  ) {
    const event = await this.prismaService.cybridSubscriptionEvent.findUnique({
      where: { event_guid: eventObject.guid },
    });
    if (!event) {
      const [eventType] = eventObject.event_type.split('.');

      const eventTypeMap: Record<string, string> = {
        transfer: cybridJobs.TRANSFER_STATUS_UPDATE,
        identity_verification: cybridJobs.IDENTITY_VERIFICATION_STATUS_UPDATE,
      };
      const event = eventTypeMap[eventType];

      if (event) {
        this.cybridQueue.add(event, eventObject, {
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
