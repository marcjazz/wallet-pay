import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import {
  CybridCustomerStatus,
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

  @Process(cybridJobs.PULLING_CYBRID_CUSTOMER)
  async pullCybridCustomer(job: Job<string>) {
    this.logger.debug('Pulling cybrid customer...');

    const customer = await this.cybridService.getCustomer(job.data);
    if (!customer.state || customer.state === CybridCustomerStatus.STORING) {
      throw new Error('Customer creation not completed yet!');
    }

    this.prismaService.cybridCustomer.update({
      data: {
        status: customer.state.toLocaleUpperCase() as CybridCustomerStatus,
      },
      where: { cybrid_customer_guid: job.data },
    });

    this.logger.log(
      `Successfully pulled customer from cybrid and updated database`
    );
  }

  @Process(cybridJobs.IDENTITY_VERIFICATION_STATUS_UPDATE)
  async updateIdentityVerificationStatus(
    job: Job<CybridSubscriptionEventObjectDto>
  ) {
    const { event_type: eventType, guid } = job.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const verificationStatus =
      status.toLocaleUpperCase() as IdentityVerificationStatus;

    await this.prismaService.$transaction([
      this.prismaService.cybridCustomer.updateMany({
        data: {
          verification_status: verificationStatus,
        },
        where: { identity_verification_guid: guid },
      }),
      this.prismaService.cybridExternalAccount.updateMany({
        data: {
          verification_status: verificationStatus,
        },
        where: { identity_verification_guid: guid },
      }),
    ]);

    this.logger.log(
      `Successfully processed ${eventType} from cybrid and updated database`
    );
  }

  @Process(cybridJobs.PULLING_CYBRID_TRANSFER)
  async pullInitiatedTransfer(job: Job<[string, string, string]>) {
    this.logger.debug('Pulling cybrid initiate transfer on cybrid...');

    const [customerGuid, accountGuid, transferGuid] = job.data;
    const transfer = await this.cybridService.getTransfer(
      customerGuid,
      transferGuid
    );

    if (
      transfer.state != CybridTransactionStatus.COMPLETED &&
      transfer.state != CybridTransactionStatus.FAILED
    ) {
      throw new Error(
        'External bank account identity verification not completed yet!'
      );
    }

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
        data: {
          status: transfer.state.toLocaleUpperCase() as CybridTransactionStatus,
        },
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
