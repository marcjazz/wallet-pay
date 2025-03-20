import { BullModule } from '@nestjs/bull';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { mailerConstants } from './constant';
import { MailerProcessor } from './mailer.processor';
import { MailerService } from './mailer.service';

@Global()
@Module({
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
    {
      provide: mailerConstants.TRANSPOTER,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('SMTP_HOST');
        const port = configService.get<number>('SMTP_PORT');
        const pass = configService.get<string>('APP_EMAIL_PASS');
        const user = configService.get<string>('APP_EMAIL');

        const transporter = createTransport({
          host,
          port,
          secure: false,
          auth: { user, pass },
          requireTLS: true,
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
          debug: true,
        });

        transporter
          .verify()
          .then(() =>
            Logger.log('Transpoter is ready to go 🚀', MailerModule.name)
          )
          .catch((error) => Logger.error(error, MailerModule.name));

        return transporter;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailerService],
})
export class MailerModule {}
