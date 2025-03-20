import { Module } from '@nestjs/common';
import { OTPController } from './otp/otp.controller';
import { OTPService } from './otp/otp.service';

@Module({
  controllers: [OTPController],
  providers: [OTPService],
  exports: [OTPService],
})
export class TwoFAModule {}
