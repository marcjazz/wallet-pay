import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as webpush from 'web-push';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const validSubject = this.configService.get('VAPID_SUBJECT');
    const validPublicKey = this.configService.get('VAPID_PUBLIC_KEY');
    const validPrivateKey = this.configService.get('VAPID_PRIVATE_KEY');

    webpush.setVapidDetails(validSubject, validPublicKey, validPrivateKey);
  }

  async sendNotification(userId: string, payload: CreateNotificationDto) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { person_id: userId },
    });

    if (subscriptions.length === 0) {
      this.logger.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify(payload);
    const promises = subscriptions.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        )
        .catch((error) => {
          this.logger.error(
            `Error sending push notification to ${sub.endpoint}`,
            error.stack
          );
          if (error.statusCode === 410) {
            this.logger.log(
              `Subscription ${sub.endpoint} has expired. Deleting...`
            );
            return this.prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
        })
    );

    await Promise.all(promises);
  }

  async createSubscription(
    userId: string,
    subscription: webpush.PushSubscription
  ) {
    return this.prisma.pushSubscription.create({
      data: {
        person_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }
}
