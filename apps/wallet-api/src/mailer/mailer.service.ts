import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { mailerConstants } from './constant';
import { ISendTextMail } from './mailer.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @InjectQueue(mailerConstants.QUEUE)
    private mailerQueue: Queue
  ) {}

  async sendText({
    from = 'PAY.XAFSHOP LLC support@xafshop.com',
    ...payload
  }: ISendTextMail) {
    this.logger.debug('Add text-mailer job to queue...');

    await this.mailerQueue.add(
      'text-mailer',
      { ...payload, from },
      { backoff: { type: 'fixed', delay: 5000 } }
    );
  }
}
