import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { IdentityVerificationStatus } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class IdentityVerificationProcessor {
  private readonly logger = new Logger(IdentityVerificationProcessor.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Process(constants.CYBRID_IDENTITY_VERIFICATION_EVENTS)
  async handleIdentityVerificationEvents(
    job: Job<CybridSubscriptionEventObjectDto>
  ) {
    const { event_type: eventType, object_guid: objectGuid, guid } = job.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const verificationStatus =
      status.toLocaleUpperCase() as IdentityVerificationStatus;

    const counterparty = await this.prismaService.cybridCounterparty.findUnique(
      {
        where: {
          identity_verification_guid: guid,
          cybrid_counterparty_guid: objectGuid,
        },
      }
    );

    if (counterparty) {
      await this.prismaService.cybridCounterparty.update({
        data: { verification_status: verificationStatus },
        where: {
          identity_verification_guid: guid,
          cybrid_counterparty_guid: objectGuid,
        },
      });
    } else {
      const externalAccount =
        await this.prismaService.cybridExternalAccount.findUnique({
          where: {
            identity_verification_guid: guid,
            cybrid_external_account_guid: objectGuid,
          },
        });

      if (externalAccount) {
        await this.prismaService.cybridExternalAccount.update({
          data: { verification_status: verificationStatus },
          where: {
            identity_verification_guid: guid,
            cybrid_external_account_guid: objectGuid,
          },
        });
      } else {
        const customer = await this.prismaService.cybridCustomer.findUnique({
          where: {
            identity_verification_guid: guid,
            cybrid_customer_guid: objectGuid,
          },
        });
        if (customer) {
          await this.prismaService.cybridCustomer.update({
            data: { verification_status: verificationStatus },
            where: {
              identity_verification_guid: guid,
              cybrid_customer_guid: objectGuid,
            },
          });
        }
      }
    }

    this.logger.log(
      `Successfully processed ${eventType} from cybrid and updated database`
    );
  }
}
