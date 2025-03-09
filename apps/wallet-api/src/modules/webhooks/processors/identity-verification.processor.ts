import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { IdentityVerificationStatus } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class IdentityVerificationProcessor {
  private readonly logger = new Logger(IdentityVerificationProcessor.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  @Process(constants.CYBRID_IDENTITY_VERIFICATION_EVENTS)
  async handleIdentityVerificationEvents(
    job: Job<CybridSubscriptionEventObjectDto>
  ) {
    const { event_type: eventType, object_guid: objectGuid, guid } = job.data;
    this.logger.log(job.data)
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}, objectGuid: ${objectGuid}) from cybrid...`
    );

    const customer = await this.prismaService.cybridCustomer.findFirst({
      include: {
        // cybrid_customer_guid: true,
        CybridExternalAccounts: {
          take: 1,
          where: { identity_verification_guid: objectGuid },
        },
        Person: {
          select: {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const verificationStatus =
      identityVerfication.outcome == 'failed'
        ? IdentityVerificationStatus.FAILED
        : (status.toLocaleUpperCase() as IdentityVerificationStatus);

    if (counterparty) {
      await this.prismaService.cybridCounterparty.updateMany({
        data: {
          verification_status: verificationStatus,
          status:
            verificationStatus === 'COMPLETED' ? 'VERIFIED' : 'UNVERIFIED',
        },
        where: {
          identity_verification_guid: objectGuid,
          cybrid_counterparty_guid: counterparty.cybrid_counterparty_guid,
        },
      });
    } else if (externalAccount) {
      await this.prismaService.cybridExternalAccount.update({
        data: {
          verification_status: verificationStatus,
          status:
            verificationStatus === 'COMPLETED' ? 'COMPLETED' : 'UNVERIFIED',
        },
        where: {
          identity_verification_guid: objectGuid,
          cybrid_external_account_guid:
            externalAccount.cybrid_external_account_guid,
        },
      });
    } else {
      await this.prismaService.cybridCustomer.update({
        data: {
          verification_status: verificationStatus,
          status:
            verificationStatus === 'COMPLETED' ? 'VERIFIED' : 'UNVERIFIED',
        },
        where: {
          cybrid_customer_guid: customerGuid,
          identity_verification_guid: objectGuid,
        },
      });
    }

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid`
    );
  }
}
