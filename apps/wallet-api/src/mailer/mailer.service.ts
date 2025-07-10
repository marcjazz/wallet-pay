import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import Mail from 'nodemailer/lib/mailer';
import { validatePhoneNumber } from '../helpers/utils';
import { PrismaService } from '../prisma/prisma.service';
import { mailerConstants } from './constant';
import { generatePayoutReceiptEmail } from './emails/payout-email';
import {
  generateTransactionReceiptEmail,
  TransactionReceipt,
} from './emails/transaction-email';
import { SurverPerson } from '../types/payout';
import { generateSurveyEmail } from './emails/surver-email';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @InjectQueue(mailerConstants.QUEUE)
    private mailerQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  async sendMessage({
    from = 'XAfPay Inc no-reply@xafpay.com',
    ...payload
  }: Mail.Options) {
    this.logger.debug('Add text-mailer job to queue...');

    return await this.mailerQueue.add('text-mailer', { ...payload, from });
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

    const sendingEmail = await this.sendMessage({
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

    // Initiate sending survey email when receipt mail has been send alreasy
    if (sendingEmail) {
      await this.sendSurveyEmail({
        person_id: person.person_id,
        email: person.email,
        first_name: person.first_name,
      });
    }

    return { person, cybridCounterparty };
  }

  private async sendSurveyEmail({
    person_id,
    email,
    first_name: name,
  }: SurverPerson) {
    const cybridTransactions =
      await this.prismaService.cybridTransaction.findMany({
        where: {
          InitiatedBy: {
            person_id,
          },
        },
      });
    if (cybridTransactions.length === 1) {
      // send survey email
      await this.sendMessage({
        to: email,
        subject: `Help Us Improve Xafpay – Share Your Feedback!`,
        html: generateSurveyEmail(name),
      });
    }
    return;
  }
}
