import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import {
  CybridTransactionStatus,
  IdentityVerificationStatus,
  PrismaPromise
} from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { cybridConstants, cybridJobs } from './constants';
import { CybridService } from './cybrid.service';
import { CybridSubscriptionEventObjectDto } from './subscriptions/cybrid-subscription.dto';

@Processor(cybridConstants.QUEUE)
//FIXME: Move database related instruction out of this module
export class CybridProcessor {
  private readonly logger = new Logger(CybridProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService
  ) {}

  @Process(cybridJobs.IDENTITY_VERIFICATION_STATUS_UPDATE)
  async updateIdentityVerificationStatus(
    job: Job<CybridSubscriptionEventObjectDto>
  ) {
    const { event_type: eventType, object_guid: objectGuid, guid } = job.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const verificationStatus =
      status.toLocaleUpperCase() as IdentityVerificationStatus;

    const object = await this.prismaService.cybridCustomer.findUnique({
      where: {
        identity_verification_guid: guid,
        cybrid_customer_guid: objectGuid,
      },
    });

    if (object) {
      await this.prismaService.cybridCustomer.update({
        data: { verification_status: verificationStatus },
        where: {
          identity_verification_guid: guid,
          cybrid_customer_guid: objectGuid,
        },
      });
    } else {
      const object = await this.prismaService.cybridExternalAccount.findUnique({
        where: {
          identity_verification_guid: guid,
          cybrid_external_account_guid: objectGuid,
        },
      });

      if (object) {
        await this.prismaService.cybridExternalAccount.update({
          data: { verification_status: verificationStatus },
          where: {
            identity_verification_guid: guid,
            cybrid_external_account_guid: objectGuid,
          },
        });
      }
    }

    this.logger.log(
      `Successfully processed ${eventType} from cybrid and updated database`
    );
  }

  @Process(cybridJobs.TRANSFER_STATUS_UPDATE)
  async pullInitiatedTransfer(job: Job<CybridSubscriptionEventObjectDto>) {
    this.logger.debug('Pulling cybrid initiate transfer on cybrid...');

    const { event_type: eventType, object_guid: transferGuid } = job.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const verificationStatus =
      status.toLocaleUpperCase() as CybridTransactionStatus;

    const transaction = await this.prismaService.cybridTransaction.findUnique({
      include: {
        CybridAccount: {
          include: {
            CybridCustomer: { select: { cybrid_customer_guid: true } },
          },
        },
      },
      where: { cybrid_transaction_guid: transferGuid },
    });
    if (!transaction || !transaction.CybridAccount) {
      throw new Error('No transaction record was found!');
    }

    //  Do nothing if transaction status was already set to a final state
    if (transaction.status === 'COMPLETED' || transaction.status === 'FAILED') {
      return;
    }

    const {
      CybridAccount: {
        cybrid_account_guid: accountGuid,
        CybridCustomer: { cybrid_customer_guid: customerGuid },
      },
    } = transaction;
    const transfer = await this.cybridService.getTransfer(
      customerGuid,
      transferGuid
    );

    const prismaPromises: PrismaPromise<unknown>[] = [];
    if (transfer.external_bank_account_guid) {
      const externalBankAccount =
        await this.cybridService.getExternalBankAccount(
          customerGuid,
          transfer.external_bank_account_guid
        );
      prismaPromises.push(
        this.prismaService.cybridExternalAccount.update({
          data: { balance: externalBankAccount.balances?.current as number },
          where: {
            cybrid_external_account_guid: transfer.external_bank_account_guid,
          },
        })
      );
    }

    const customerAccount = await this.cybridService.getAccount(
      customerGuid,
      accountGuid
    );
    prismaPromises.push(
      this.prismaService.cybridAccount.update({
        data: { balance: customerAccount.platform_available },
        where: { cybrid_account_guid: accountGuid },
      }),
      this.prismaService.cybridTransaction.update({
        data: { status: verificationStatus },
        where: { cybrid_transaction_guid: transferGuid },
      })
    );

    // execute prisma transaction against database
    await this.prismaService.$transaction(prismaPromises);

    this.logger.log(
      `Successfully pulled ongoing transaction from cybrid and updated database`
    );
  }
}
