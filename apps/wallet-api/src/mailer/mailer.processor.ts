import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Transporter } from 'nodemailer';
import { mailerConstants } from './constant';
import { ISendTextMail } from './mailer.interface';

@Processor()
export class MailerProcessor {
  constructor(
    @Inject(mailerConstants.TRANSPOTER) private transpoter: Transporter
  ) {}

  @Process('text-mailer')
  async handleMailQueue(job: Job<ISendTextMail>) {
    const info = await this.transpoter.sendMail(job.data);
    return info.messageId;
  }
}
