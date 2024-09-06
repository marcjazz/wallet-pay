import { Module } from '@nestjs/common';
import { OTPService } from './services/otp.service';

@Module({
  providers: [OTPService],
  exports: [OTPService],
})
export class TwoFAModule {}
