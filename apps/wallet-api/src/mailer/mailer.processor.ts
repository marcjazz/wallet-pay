import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Transporter } from 'nodemailer';
import { mailerConstants } from './constant';
import { ISendTextMail } from './mailer.interface';

@Processor(mailerConstants.QUEUE)
export class MailerProcessor {
  private readonly logger = new Logger(MailerProcessor.name);

  constructor(
    @Inject(mailerConstants.TRANSPOTER) private transpoter: Transporter
  ) {}

  @Process('text-mailer')
  async handleMailQueue(job: Job<ISendTextMail>) {
    this.logger.debug('Processing text-mailer job...');

    const info = await this.transpoter.sendMail(job.data);

    this.logger.log(
      `Successfully processed text-mailer job: ${info.messageId}`
    );
    return info.messageId;
  }
}
