import {
  Body,
  Controller,
  ParseEnumPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OTPEntity, VerifyOTPDto } from '../dto/two-fa.dto';
import { OTPService } from './otp.service';
import { TwoFAUsage } from '../two-fa.interface';
import { MailerService } from '../../../mailer/mailer.service';

@ApiTags('2FA')
@Controller('two-fa/otp')
export class TwoFAController {
  constructor(
    private readonly otpService: OTPService,
    private readonly mailerService: MailerService
  ) {}

  @Post('request')
  @ApiCreatedResponse({ type: OTPEntity })
  async requestTwoFA(
    @Req() req: Request,
    @Body('usage', new ParseEnumPipe(TwoFAUsage)) usage: TwoFAUsage
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('user not connected!');
    }

    const otp = await this.otpService.request(user.id, usage);
    await this.mailerService.sendText({
      to: `${user.first_name} <${user.email}>`,
      subject: 'Verification code',
      text: `Your verification code is ${otp.code}`,
    });

    return new OTPEntity(otp);
  }

  @Post('verify')
  @ApiCreatedResponse({
    schema: { properties: { is_verified: { type: 'boolean' } } },
  })
  async verifyOTP(payload: VerifyOTPDto) {
    const isVerified = await this.otpService.verify(
      payload.otp_id,
      payload.code
    );
    return { is_verified: isVerified };
  }
}
