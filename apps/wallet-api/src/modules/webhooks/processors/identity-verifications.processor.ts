import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { verificationStatusFrom } from '../../../helpers/utils';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';
import { PushNotificationsService } from '../../notifications/push-notifications.service';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class IdentityVerificationsProcessor {
  private readonly logger = new Logger(IdentityVerificationsProcessor.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService,
    private readonly pushNotificationsService: PushNotificationsService
  ) {}

  @Process(constants.CYBRID_IDENTITY_VERIFICATION_EVENTS)
  async handle(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, object_guid: objectGuid, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}, objectGuid: ${objectGuid}) from cybrid...`
    );

    const customer = await this.prismaService.cybridCustomer.findFirst({
      select: {
        cybrid_customer_guid: true,
        CybridExternalAccounts: {
          take: 1,
          where: { identity_verification_guid: objectGuid },
        },
        Person: {
          select: {
            person_id: true,
            Receivers: {
              take: 1,
              where: { identity_verification_guid: objectGuid },
            },
          },
        },
      },
      where: {
        OR: [
          { identity_verification_guid: objectGuid },
          {
            CybridExternalAccounts: {
              some: { identity_verification_guid: objectGuid },
            },
          },
          {
            Person: {
              Receivers: {
                some: { identity_verification_guid: objectGuid },
              },
            },
          },
        ],
      },
    });

    if (!customer) {
      this.logger.debug(
        `No customer found to process for ${eventType} event. Guid: ${guid}, objectGuid: ${objectGuid}`
      );
      return;
    }

    const {
      Person: {
        person_id: personId,
        Receivers: [counterparty],
      },
      cybrid_customer_guid: customerGuid,
      CybridExternalAccounts: [externalAccount],
    } = customer;

    const identityVerfication =
      await this.cybridService.getIdentityVerification(
        customerGuid,
        objectGuid
      );

    const verificationStatus = verificationStatusFrom(identityVerfication);

    const data: CreateNotificationDto = {
      title: '',
      body: '',
    };

    if (counterparty) {
      await this.prismaService.cybridCounterparty.updateMany({
        data: {
          verification_status: verificationStatus,
          status: verificationStatus === 'PASSED' ? 'VERIFIED' : 'UNVERIFIED',
        },
        where: {
          identity_verification_guid: objectGuid,
          cybrid_counterparty_guid: counterparty.cybrid_counterparty_guid,
        },
      });
      data.title = `Counterparty ${counterparty.fullname} Status Updated`;
      data.body = `The verification status for counterparty ${counterparty.fullname} has been updated to ${verificationStatus}.`;
    } else if (externalAccount) {
      await this.prismaService.cybridExternalAccount.update({
        data: {
          verification_status: verificationStatus,
          status: verificationStatus === 'PASSED' ? 'VERIFIED' : 'UNVERIFIED',
        },
        where: {
          identity_verification_guid: objectGuid,
          cybrid_external_account_guid:
            externalAccount.cybrid_external_account_guid,
        },
      });
      data.title = `External Account ...${externalAccount.mask} Status Updated`;
      data.body = `The verification status for your external account ${externalAccount.name} (...${externalAccount.mask}) has been updated to ${verificationStatus}.`;
    } else {
      await this.prismaService.cybridCustomer.update({
        data: {
          verification_status: verificationStatus,
          status: verificationStatus === 'PASSED' ? 'VERIFIED' : 'UNVERIFIED',
        },
        where: {
          cybrid_customer_guid: customerGuid,
          identity_verification_guid: objectGuid,
        },
      });
      data.title = 'KYC Status Updated';
      data.body = `Your KYC status has been updated to ${verificationStatus}.`;
    }

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid`
    );

    // Send push notification
    this.pushNotificationsService.sendNotification(personId, data);
  }
}
