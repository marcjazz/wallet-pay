import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsController } from './notifications.controller';
import { PushNotificationsService } from './push-notifications.service';

@Module({
  providers: [PushNotificationsService, PrismaService],
  exports: [PushNotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
