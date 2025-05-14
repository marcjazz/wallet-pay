import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { getInsufficientFundsAlertMessage } from '../../../mailer/emails/insufficient-funds-alert';
import { getPayoutFailureAlertMessage } from '../../../mailer/emails/payout-failure-alert';
import { MailerService } from '../../../mailer/mailer.service';
import { ClientPaymentRequest } from '../../../peex/gen/types.gen';
import { PeexService } from '../../../peex/peex.service';

@Processor(constants.WEBHOOK_QUEUE)
export class PayoutProcessor {
  private readonly logger = new Logger(PayoutProcessor.name);
  constructor(
    private readonly peexService: PeexService,
    private readonly mailerService: MailerService
  ) {}

  @Process(constants.PAYOUT_PARTNER_EVENTS)
  async handle(job: Job<ClientPaymentRequest[]>) {
    const [payment] = job.data;
    const jobName = `payout.${payment?.status}`;
    this.logger.log(
      `Processing (event: ${jobName}, PayoutRef: ${payment?.track_id}...`
    );
    if (!payment?.track_id) {
      this.logger.error(
        `Could not process event: Missing tranck id ${JSON.stringify(job.data)}`
      );
      return;
    }
    const transactionGuidOrId = payment.track_id.split('.')[1];

    if (payment?.status === 'failed') {
      this.mailerService.sendMessage({
        subject: 'Insufficient Funds Alert',
        text: getPayoutFailureAlertMessage(
          payment.track_id,
          payment.identifier_by as string,
          payment.amount as number,
          payment.message as string
        ),
        to: 'XAfPay Inc <no-reply@xafpay.com>',
      });
    } else if (payment?.status === 'paid') {
      // Sending remittance settlement email
      await this.mailerService.sendReceiptEmail({
        transactionGuidOrId,
        amountReceived: payment.amount,
        payoutAt: new Date(payment.updated_at as string),
      });
    }

    this.logger.log(`Successfully processed (event: ${jobName}) from server.`);
  }

  @Process(constants.INITIATE_PAYOUT_EVENTS)
  async handlePayout(
    job: Job<{
      amount: number;
      trackId: string;
      receipientPhonenumber: string;
    }>
  ) {
    const jobName = job.name;
    const { amount, receipientPhonenumber, trackId } = job.data;
    this.logger.log(
      `Processing (event: ${jobName}, PayoutRef: ${job.attemptsMade}.${trackId})...`
    );

    try {
      const accountInfo = await this.peexService.getPartnerInfo();
      if ((accountInfo?.solde ?? 0) < amount) {
        this.mailerService.sendMessage({
          subject: 'Insufficient Funds Alert',
          text: getInsufficientFundsAlertMessage(
            accountInfo?.solde ?? 0,
            amount
          ),
          to: 'XAfPay Inc <no-reply@xafpay.com>',
        });
        throw new Error('Insufficient funds');
      }

      const payment = await this.peexService.requestPayment({
        amount,
        track_id: `${job.attemptsMade}.${trackId}`,
        mobile_phone: receipientPhonenumber,
      });

      if (payment?.status === 'rejected') {
        throw new Error(`${payment?.payment_proof}: Failed to place payment!`);
      }

      this.logger.log(`Successfully processed (event: ${jobName})`);
    } catch (error) {
      this.logger.error(`Payout failed: ${error.message}`);
      throw new Error('Failed to place payment!');
    }
  }
}
