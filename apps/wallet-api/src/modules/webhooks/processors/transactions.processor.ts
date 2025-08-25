import { Process, Processor } from '@nestjs/bull';
import { Logger, NotImplementedException } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { MailerService } from '../../../mailer/mailer.service';
import { PushNotificationsService } from '../../notifications/push-notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';
import { parseEventObject } from '../helpers/event-parser';

@Processor(constants.WEBHOOK_QUEUE)
export class TransactionsProcessor {
  private readonly logger = new Logger(TransactionsProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
    private readonly pushNotificationsService: PushNotificationsService
  ) {}

  @Process(constants.CYBRID_TRANSFER_EVENTS)
  async handle(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}) from cybrid...`
    );

    const parsedObject = await parseEventObject(job.data, {
      logger: this.logger,
      prisma: this.prismaService,
    });
    if (!parsedObject) {
      return;
    }

    const {
      customerGuid,
      transactionGuid,
      transactionStatus,
      transaction: cybridTransaction,
    } = parsedObject;

    const transfer = await this.cybridService.getTransfer(
      customerGuid,
      transactionGuid
    );

    const updateOperations: PrismaPromise<unknown>[] = [];

    const supportedTransfeTypes = [
      'crypto',
      'book',
      'funding',
      'instant_funding',
    ];
    if (!supportedTransfeTypes.includes(transfer.transfer_type ?? '')) {
      throw new NotImplementedException(
        `${transfer.transfer_type} transfers not supported yet!`
      );
    }

    if (transfer.transfer_type?.includes('funding')) {
      // Insant funding is done with usd account
      const fiatAccount = await this.cybridService.getAccount(
        customerGuid,
        transfer.destination_account?.guid ?? ''
      );

      updateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            // Convert cents to USD
            balance: (fiatAccount.platform_available as number) / 100,
          },
          where: { cybrid_account_guid: fiatAccount.guid },
        })
      );
    } else if (
      transfer.transfer_type === 'book' &&
      cybridTransaction.transaction_type === 'REMITTANCE' &&
      transfer.state === 'completed'
    ) {
      // Book transfer (actual remittance) is done with usdc_sol account
      const cryptoAccount = await this.cybridService.getAccount(
        customerGuid,
        transfer.source_account?.guid ?? ''
      );
      updateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            // Convert lamports to SOL
            balance: (cryptoAccount.platform_available as number) / 1e6,
          },
          where: { cybrid_account_guid: cryptoAccount.guid },
        })
      );

      // Sending remittance settlement email
      await this.mailerService.sendReceiptEmail({
        transactionGuidOrId: cybridTransaction.cybrid_transaction_guid,
      });
    } else if (
      transfer.transfer_type === 'crypto' &&
      'FAILED' === transactionStatus
    ) {
      // Resetting related transaction in case settlement fails.
      updateOperations.push(
        this.prismaService.cybridTransaction.updateMany({
          data: { withdrawal_transaction_id: null },
          where: { withdrawal_transaction_id: transactionGuid },
        })
      );
    }

    updateOperations.push(
      this.prismaService.cybridTransaction.update({
        data:
          transactionStatus === 'COMPLETED'
            ? { settled_at: new Date(), status: transactionStatus }
            : { status: transactionStatus },
        where: { cybrid_transaction_guid: transactionGuid },
      })
    );

    // execute prisma transaction against database
    await this.prismaService.$transaction(updateOperations);

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid.`
    );
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { cybrid_customer_guid: customerGuid },
    });

    if (customer) {
      await this.pushNotificationsService.sendNotification(customer.person_id, {
        title: 'Transaction update',
        body: `Your transaction status has been updated to ${transactionStatus}`,
      });
    }
  }
}
