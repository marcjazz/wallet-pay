import { Module } from '@nestjs/common';
import { OTPService } from './otp/otp.service';

@Module({
  providers: [OTPService],
  exports: [OTPService],
})
export class TwoFAModule {}
