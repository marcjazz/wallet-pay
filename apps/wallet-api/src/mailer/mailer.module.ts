import {
  DynamicModule,
  Global,
  InternalServerErrorException,
  Logger,
  Module,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { MailerOptions } from './mailer.interface';
import { MailerService } from './mailer.service';
import { BullModule } from '@nestjs/bull';
import { mailerConstants } from './constant';
import { MailerProcessor } from './mailer.processor';

@Global()
@Module({})
export class MailerModule {
  static forRoot({
    host,
    secure,
    pass: authPass,
    user: authUser,
  }: MailerOptions): DynamicModule {
    if (!host || !authUser || !authPass) {
      throw new InternalServerErrorException(
        'Mailer host, user and pass not configured!'
      );
    }

    const transporter = createTransport({
      host,
      secure, // true for port 465, false for other ports
      port: secure ? 465 : 587,
      auth: {
        user: authUser,
        pass: authPass,
      },
    });
    transporter
      .verify()
      .then(() =>
        Logger.log('Transpoter is ready to go 🚀', MailerModule.name)
      );

    return {
      module: MailerModule,
      imports: [
        BullModule.registerQueue({
          name: mailerConstants.QUEUE,
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        }),
      ],
      providers: [
        MailerService,
        MailerProcessor,
        { useValue: transporter, provide: mailerConstants.TRANSPOTER },
      ],
      exports: [MailerService],
    };
  }
}
