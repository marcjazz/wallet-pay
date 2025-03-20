import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { mailerConstants } from './constant';

@Processor(mailerConstants.QUEUE)
export class MailerProcessor {
  private readonly logger = new Logger(MailerProcessor.name);

  constructor(
    @Inject(mailerConstants.TRANSPOTER) private transporter: Transporter
  ) {}

  @Process('text-mailer')
  async handleMailQueue(job: Job<Mail.Options>) {
    this.logger.debug('Processing text-mailer job...');

    const info = await this.transporter.sendMail(job.data);

    this.logger.log(
      `Successfully processed text-mailer job: ${info.messageId}`
    );
    return info.messageId;
  }
}
