import { Process, Processor } from '@nestjs/bull';
import { Logger, NotImplementedException } from '@nestjs/common';
import { CybridTransactionStatus, PrismaPromise } from '@prisma/client';
import { Job } from 'bull';
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
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';

@Processor(constants.WEBHOOK_QUEUE)
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly pawapayService: PawapayService
  ) {}

  @Process(constants.CYBRID_TRANSFER_EVENTS)
  async handleCybridTransferEvents(job: Job<CybridSubscriptionEventObjectDto>) {
    this.logger.log(`Handling cybrid's ${job.data.event_type}...`);

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
          data: { balance: externalBankAccount.balances?.current as number },
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
        const person = await this.sendReceiptEmail(
          cybridTransaction.cybrid_transaction_guid,
          receiptUrl
        );

        const amountReceived =
          cybridTransaction.amount *
          (cybridTransaction.conversion_rate as number);
        const payoutTransaction = await this.pawapayService.initiatePayout({
          amount: amountReceived,
          customerEmail: person.email,
          payoutId: cybridTransaction.pawapay_payout_id,
          transactionId: cybridTransaction.transaction_id,
          receipientPhonenumber: person.phone_number.includes('237')
            ? person.phone_number
            : `237${person.phone_number}`,
        });

        payoutId = payoutTransaction.payoutId;
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
        data: { balance: customerAccount.platform_available },
        where: { cybrid_account_guid: accountGuid },
      })
    );

    // execute prisma transaction against database
    await this.prismaService.$transaction(prismaPromises);

    this.logger.log(`Successfully handled cybrid's ${job.data.event_type}.`);
  }

  @Process(constants.CYBRID_TRADE_EVENTS)
  async handleCybridTradeEvents(job: Job<CybridSubscriptionEventObjectDto>) {
    this.logger.log(`Handling cybrid's ${job.data.event_type}...`);

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

    this.logger.log(`Successfully handled cybrid's ${job.data.event_type}.`);

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

  private async parseCybridEventObject(
    eventObject: CybridSubscriptionEventObjectDto
  ) {
    const { event_type: eventType, object_guid: transactionGuid } = eventObject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, status] = eventType.split('.');
    const transactionStatus =
      status.toLocaleUpperCase() as CybridTransactionStatus;

    const transaction = await this.prismaService.cybridTransaction.findUnique({
      include: { InitiatedBy: { select: { cybrid_customer_guid: true } } },
      where: { cybrid_transaction_guid: transactionGuid },
    });
    if (!transaction) {
      throw new Error(
        `No transaction record was found for ${transactionGuid}!`
      );
    }

    //  Do nothing if transaction status was already set to a final state
    if (transaction.status === 'COMPLETED' || transaction.status === 'FAILED') {
      this.logger.debug(
        `Handled cybrid's ${eventType}: transaction was already finalized`
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

    return person;
  }
}
