import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger, NotImplementedException } from '@nestjs/common';
import { CybridTransactionStatus, PrismaPromise } from '@prisma/client';
import { Job, Queue } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { validatePhoneNumber } from '../../../helpers/utils';
import { generatePayoutReceiptEmail } from '../../../mailer/emails/payout-email';
import {
  generateTransactionReceiptEmail,
  TransactionReceipt,
} from '../../../mailer/emails/transaction-email';
import { MailerService } from '../../../mailer/mailer.service';
import { PawapayService } from '../../../pawapay/pawapay.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  InitiatePayoutPayload,
  PawapayPayoutEntity,
} from '../../../types/pawapay';
import { PawapayPayoutStatus } from '../../../types/pawapay/enum';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly pawapayService: PawapayService,
    @InjectQueue(constants.WEBHOOK_QUEUE) private readonly webhooksQueue: Queue
  ) {}

  @Process(constants.CYBRID_TRANSFER_EVENTS)
  async handleCybridTransferEvents(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}) from cybrid...`
    );

    const parsedObject = await this.parseCybridEventObject(job.data);
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

    const prismaPromises: PrismaPromise<unknown>[] = [];
    if (transfer.external_bank_account_guid) {
      const externalBankAccount =
        await this.cybridService.getExternalBankAccount(
          customerGuid,
          transfer.external_bank_account_guid
        );
      prismaPromises.push(
        this.prismaService.cybridExternalAccount.update({
          // Convert cents to USD
          data: {
            balance: (externalBankAccount.balances?.current as number) / 100,
          },
          where: {
            cybrid_external_account_guid: transfer.external_bank_account_guid,
          },
        })
      );
    }

    if (transfer.transfer_type === 'crypto') {
      if (transactionStatus === 'COMPLETED') {
        prismaPromises.push(
          this.prismaService.cybridTransaction.updateMany({
            data: { settled_at: new Date() },
            where: { cybrid_transfer_settlement_guid: transactionGuid },
          })
        );
      }
    } else if (transfer.transfer_type === 'book') {
      let payoutId: string | undefined;
      if (transactionStatus === 'COMPLETED') {
        const receiptUrl = `/remittance/${cybridTransaction.cybrid_transaction_id}`;
        // Sending remittance settlement email
        const { person, cybridCounterparty } = await this.sendReceiptEmail(
          cybridTransaction.cybrid_transaction_guid,
          receiptUrl
        );

        const amountReceived =
          cybridTransaction.initial_currency_amount *
          (cybridTransaction.conversion_rate as number);
        const phoneNumber = cybridCounterparty?.phone_number;
        const initiatePayoutPayload = {
          amount: amountReceived,
          customerEmail: person.email,
          payoutId: cybridTransaction.pawapay_payout_id,
          transactionId: cybridTransaction.transaction_id,
          receipientPhonenumber: phoneNumber?.includes('237')
            ? phoneNumber
            : `237${phoneNumber}`,
        };

        await this.initiatePawapayPayout(
          initiatePayoutPayload,
          transactionGuid
        );
      }

      prismaPromises.push(
        this.prismaService.cybridTransaction.update({
          data: { status: transactionStatus, pawapay_payout_id: payoutId }, // Book transfers are settled by crypto transfers
          where: { cybrid_transaction_guid: transactionGuid },
        })
      );
    } else if (transfer.transfer_type === 'instant_funding') {
      prismaPromises.push(
        this.prismaService.cybridTransaction.update({
          data:
            transactionStatus === 'COMPLETED'
              ? { settled_at: new Date(), status: transactionStatus }
              : { status: transactionStatus },
          where: { cybrid_transaction_guid: transactionGuid },
        })
      );
    } else
      throw new NotImplementedException(
        `${transfer.transfer_type} not supported yet!`
      );

    const accountGuid = (
      transfer.external_bank_account_guid
        ? transfer.destination_account?.guid
        : transfer.source_account?.guid
    ) as string;
    const customerAccount = await this.cybridService.getAccount(
      customerGuid,
      accountGuid
    );
    prismaPromises.push(
      this.prismaService.cybridAccount.update({
        // Convert cents to USD
        data: { balance: (customerAccount.platform_available as number) / 100 },
        where: { cybrid_account_guid: accountGuid },
      })
    );

    // execute prisma transaction against database
    await this.prismaService.$transaction(prismaPromises);

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid.`
    );
  }

  @Process(constants.CYBRID_TRADE_EVENTS)
  async handleCybridTradeEvents(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}) from cybrid...`
    );

    const parsedObject = await this.parseCybridEventObject(job.data);
    if (!parsedObject) {
      return;
    }

    const { customerGuid, transactionGuid, transactionStatus } = parsedObject;

    const { CryptoCybridAccount: cryptoAccount, CybridAccount: fiatAccount } =
      await this.prismaService.cybridTransaction.findUniqueOrThrow({
        select: {
          CryptoCybridAccount: { select: { cybrid_account_guid: true } },
          CybridAccount: { select: { cybrid_account_guid: true } },
        },
        where: { cybrid_transaction_guid: transactionGuid },
      });

    const prismaPromises: PrismaPromise<unknown>[] = [];
    if (cryptoAccount) {
      await updateAccountBalance(cryptoAccount.cybrid_account_guid);
    }
    if (fiatAccount) {
      await updateAccountBalance(fiatAccount.cybrid_account_guid);
    }

    await this.prismaService.$transaction([
      ...prismaPromises,
      this.prismaService.cybridTransaction.update({
        data:
          transactionStatus === 'COMPLETED'
            ? { status: transactionStatus, settled_at: new Date() }
            : { status: transactionStatus },
        where: { cybrid_transaction_guid: transactionGuid },
      }),
    ]);

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid.`
    );

    async function updateAccountBalance(cryptoAccountGuid: string) {
      const cybridCryptoAccount = await this.cybridService.getAccount(
        customerGuid,
        cryptoAccountGuid
      );
      prismaPromises.push(
        this.prismaService.cybridAccount.update({
          data: { balance: cybridCryptoAccount.platform_available },
          where: { cybrid_account_guid: cryptoAccountGuid },
        })
      );
    }
  }

  @Process(constants.PAWAPAY_PAYOUT_EVENTS)
  async handlePawapayPayoutEvents(job: Job<PawapayPayoutEntity>) {
    const { payoutId, status, amount } = job.data;

    let transaction = await this.prismaService.cybridTransaction.findFirst({
      where: { pawapay_payout_id: payoutId, settled_at: null },
    });
    if (!transaction) {
      this.logger.error(
        `No transaction record was found for payout Id: ${payoutId}!`
      );
      return;
    }

    if (
      transaction.status === 'COMPLETED' &&
      status === PawapayPayoutStatus.ACCEPTED
    ) {
      transaction = await this.prismaService.cybridTransaction.update({
        data: { settled_at: new Date() },
        where: { cybrid_transaction_id: transaction.cybrid_transaction_id },
      });

      const receiptUrl = `/remittance/${transaction.cybrid_transaction_id}`;
      // Sending payout receipt email
      await this.sendReceiptEmail(
        transaction.cybrid_transaction_guid,
        receiptUrl,
        new Date(),
        Number(amount)
      );
    }
  }

  private async parseCybridEventObject(
    eventObject: CybridSubscriptionEventObjectDto
  ) {
    const {
      guid,
      event_type: eventType,
      object_guid: transactionGuid,
    } = eventObject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const transactionStatus =
      status.toLocaleUpperCase() as CybridTransactionStatus;

    const transaction = await this.prismaService.cybridTransaction.findUnique({
      include: { InitiatedBy: { select: { cybrid_customer_guid: true } } },
      where: { cybrid_transaction_guid: transactionGuid },
    });
    if (!transaction) {
      this.logger.error(
        `No transaction record was found for ${transactionGuid}!`
      );
      return;
    }

    //  Do nothing if transaction status was already set to a final state
    if (transaction.status === 'COMPLETED' || transaction.status === 'FAILED') {
      this.logger.log(
        `(event: ${eventType}, Guid: ${guid}) from cybrid was ignored because transaction was already is final state`
      );
      return;
    }

    return {
      transaction,
      transactionGuid,
      transactionStatus,
      customerGuid: transaction.InitiatedBy.cybrid_customer_guid,
    };
  }

  private async sendReceiptEmail(
    transactionGuid: string,
    receiptUrl: string,
    payoutAt?: Date,
    amountReceived?: number
  ) {
    const {
      InitiatedBy: { Person: person },
      ReceiverPayoutInfo: cybridCounterparty,
      ...cybridTransaction
    } = await this.prismaService.cybridTransaction.findUniqueOrThrow({
      include: {
        ReceiverPayoutInfo: true,
        InitiatedBy: { select: { Person: true } },
      },
      where: { cybrid_transaction_guid: transactionGuid },
    });

    const transactionId = cybridTransaction.transaction_id;
    const initiatedAt = new Date(cybridTransaction.initiated_at);
    const recipientPhoneNumber = cybridCounterparty?.phone_number;
    const mobileMoneyPartner = recipientPhoneNumber
      ? validatePhoneNumber(recipientPhoneNumber) === 0
        ? 'Mobile Money'
        : 'Orange Money'
      : 'N/A';

    const receiptData: TransactionReceipt = {
      transactionId,
      initiatedAt: initiatedAt.toString(),
      customerName: `${person.first_name} ${person.last_name}`,
      receiptUrl: `${receiptUrl}/${cybridTransaction.cybrid_transaction_id}`,
      recipientName: cybridCounterparty?.fullname ?? 'N/A',
      recipientPhoneNumber: `${recipientPhoneNumber} (${mobileMoneyPartner} Cameroon)`,
      amountSent: `${cybridTransaction.initial_currency_amount} ${cybridTransaction.initial_currency}`,
    };

    await this.mailerService.sendMessage({
      to: person.email,
      subject: payoutAt
        ? `Payout Receipt (${transactionId})`
        : `Transaction Receipt (${transactionId})`,
      html: amountReceived
        ? generatePayoutReceiptEmail({
            ...receiptData,
            amountReceived: `${amountReceived} XAF`,
            payoutAt: cybridTransaction.payout_at?.toString() ?? `N/A`,
          })
        : generateTransactionReceiptEmail(receiptData),
    });

    return { person, cybridCounterparty };
  }

  private async initiatePawapayPayout(
    initiatePayoutPayload: InitiatePayoutPayload,
    transactionGuid: string
  ) {
    const jobName = `initiate-remittance-payout-${transactionGuid}`;
    this.webhooksQueue.process(
      jobName,
      async (job: Job<typeof initiatePayoutPayload>, done) => {
        this.logger.log(`Processing (event: ${jobName}) from server...`);
        try {
          const payoutTransaction = await this.pawapayService.initiatePayout(
            job.data
          );
          await this.prismaService.cybridTransaction.update({
            data: {
              pawapay_payout_id: payoutTransaction.payoutId,
            },
            // Book transfers are settled by crypto transfers
            where: { cybrid_transaction_guid: transactionGuid },
          });
          done(null, payoutTransaction.payoutId);

          this.logger.log(
            `Successfully processed (event: ${jobName}) from server.`
          );
        } catch (error) {
          this.logger.error(error, jobName);
          done(error, null);
        }
      }
    );
    await this.webhooksQueue.add(jobName, initiatePayoutPayload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 15000 },
    });
  }
}
