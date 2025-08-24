import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushNotificationsService } from './push-notifications.service';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService
  ) {}

  @Post('subscribe')
  async subscribe(
    @Req() req: Request,
    @Body() subscription: CreatePushSubscriptionDto
  ) {
    return this.pushNotificationsService.createSubscription(
      req.user?.person_id as string,
      subscription
    );
  }
}
