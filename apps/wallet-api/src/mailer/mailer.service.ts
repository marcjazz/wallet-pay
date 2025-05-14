import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import Mail from 'nodemailer/lib/mailer';
import { mailerConstants } from './constant';
import { validatePhoneNumber } from '../helpers/utils';
import {
  generateTransactionReceiptEmail,
  TransactionReceipt,
} from './emails/transaction-email';
import { generatePayoutReceiptEmail } from './emails/payout-email';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @InjectQueue(mailerConstants.QUEUE)
    private mailerQueue: Queue,
    private prismaService: PrismaService
  ) {}

  async sendMessage({
    from = 'XAfPay Inc no-reply@xafpay.com',
    ...payload
  }: Mail.Options) {
    this.logger.debug('Add text-mailer job to queue...');

    await this.mailerQueue.add('text-mailer', { ...payload, from });
  }

  async sendReceiptEmail(emailObject: {
    transactionGuidOrId: string;
    payoutAt?: Date;
    amountReceived?: number;
  }) {
    const {
      InitiatedBy,
      ReceiverPayoutInfo: cybridCounterparty,
      ...cybridTransaction
    } = await this.prismaService.cybridTransaction.findFirstOrThrow({
      include: {
        ReceiverPayoutInfo: true,
        InitiatedBy: { select: { Person: true } },
      },
      where: {
        OR: [
          { cybrid_transaction_id: emailObject.transactionGuidOrId },
          { remittance_payout_ref: emailObject.transactionGuidOrId },
          { cybrid_transaction_guid: emailObject.transactionGuidOrId },
        ],
      },
    });
    const person = InitiatedBy?.Person;
    if (!person) {
      throw new Error('Email receiver not found!');
    }

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
      receiptUrl: `/remittance/${cybridTransaction.cybrid_transaction_id}`,
      recipientName: cybridCounterparty?.fullname ?? 'N/A',
      recipientPhoneNumber: `${recipientPhoneNumber} (${mobileMoneyPartner} Cameroon)`,
      amountSent: `${cybridTransaction.initial_currency_amount} ${cybridTransaction.initial_currency}`,
    };

    await this.sendMessage({
      to: person.email,
      subject: emailObject.payoutAt
        ? `Payout Receipt (${transactionId})`
        : `Transaction Receipt (${transactionId})`,
      html: emailObject.amountReceived
        ? generatePayoutReceiptEmail({
            ...receiptData,
            amountReceived: `${emailObject.amountReceived} XAF`,
            payoutAt: cybridTransaction.payout_at?.toString() ?? `N/A`,
          })
        : generateTransactionReceiptEmail(receiptData),
    });

    return { person, cybridCounterparty };
  }
}
