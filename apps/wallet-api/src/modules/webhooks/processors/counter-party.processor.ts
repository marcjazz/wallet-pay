import {
    PostIdentityVerificationBankModelMethodEnum,
    PostIdentityVerificationBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
    UnsupportedCybridSubcriptionEventObjectDto
} from '../dtos/cybrid-subscription.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class IdentityVerificationProcessor {
  private readonly logger = new Logger(IdentityVerificationProcessor.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  @Process(constants.INITIATE_COUNTERPARTY_VERIFICATION)
  async initiateCounterpartyVerification(
    job: Job<UnsupportedCybridSubcriptionEventObjectDto>
  ) {
    const { event_type: eventType, object_guid: objectGuid } = job.data;
    this.logger.log(
      `Initiating counterparty verification for objectGuid: ${objectGuid}, eventType: ${eventType}`
    );

    const customer = await this.prismaService.cybridCustomer.findFirst({
      select: { cybrid_customer_guid: true },
      where: {
        Person: {
          Receivers: { some: { cybrid_counterparty_guid: objectGuid } },
        },
      },
    });
    if (!customer) {
      this.logger.warn(
        `No customer found for objectGuid: ${objectGuid}, eventType: ${eventType}`
      );
      return;
    }

    // Create identity verification for such the counterparty from Cybrid platform
    const counterpartyVerification = await this.cybridService.verifyIdentity(
      customer.cybrid_customer_guid,
      {
        counterparty_guid: objectGuid,
        type: PostIdentityVerificationBankModelTypeEnum.Counterparty,
        method: PostIdentityVerificationBankModelMethodEnum.Watchlists,
      }
    );

    await this.prismaService.cybridCounterparty.update({
      data: {
        identity_verification_guid: counterpartyVerification.guid as string,
        verification_status:
          counterpartyVerification.outcome === 'failed'
            ? $Enums.IdentityVerificationStatus.FAILED
            : ((
                counterpartyVerification.outcome ??
                counterpartyVerification.state
              )?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus),
      },
      where: { cybrid_counterparty_guid: objectGuid },
    });

    this.logger.log(
      `Counterparty verification initiated for objectGuid: ${objectGuid}, eventType: ${eventType}, verificationGuid: ${counterpartyVerification.guid}`
    );
  }
}
