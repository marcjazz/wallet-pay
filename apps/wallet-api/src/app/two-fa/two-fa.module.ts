import { Module } from '@nestjs/common';
import { OTPService } from './otp/otp.service';
import { OTPController } from './otp/otp.controller';
import { MailerModule } from '../../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [OTPController],
  providers: [OTPService],
  exports: [OTPService],
})
export class TwoFAModule {}
