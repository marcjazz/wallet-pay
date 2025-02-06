import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { generateOtpCodeEmail } from '../../../mailer/emails/otp-email';
import { MailerService } from '../../../mailer/mailer.service';
import { SkipAuth } from '../../auth/auth.decorator';
import { OTPEntity, OTPPayloadDto, OTPUsageDto } from '../dto/two-fa.dto';
import { TwoFAUsage } from '../two-fa.interface';
import { OTPService } from './otp.service';

@ApiTags('2FA')
@ApiBearerAuth()
@Controller('two-fa/otp')
export class OTPController {
  constructor(
    private readonly otpService: OTPService,
    private readonly mailerService: MailerService
  ) {}

  @Post('request')
  @ApiCreatedResponse({ type: OTPEntity })
  async requestTwoFA(@Req() req: Request, @Body() usagePayload: OTPUsageDto) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('user not connected!');
    }

    const otp = await this.otpService.request(user.id, usagePayload.usage);
    await this.mailerService.sendMessage({
      to: `${user.first_name} <${user.email}>`,
      subject: 'One Time Password',
      text: `Your verification code is ${otp.code}`,
      html: generateOtpCodeEmail({ otpCode: otp.code }),
    });

    return new OTPEntity({ ...otp, usage: otp.usage as TwoFAUsage });
  }

  @SkipAuth()
  @Patch(':otp_id/resend')
  @ApiCreatedResponse({ type: OTPEntity })
  async resendOTP(@Req() req: Request, @Param('otp_id') otpId: string) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('user not connected!');
    }

    const otp = await this.otpService.resend(user.id, otpId);
    await this.mailerService.sendMessage({
      to: `${user.first_name} <${user.email}>`,
      subject: 'One Time Password',
      text: `Your verification code is ${otp.code}. This code has 5 minutes validity period.`,
      html: generateOtpCodeEmail({ otpCode: otp.code }),
    });

    return new OTPEntity({ ...otp, usage: otp.usage as TwoFAUsage });
  }

  @Post('verify')
  @ApiCreatedResponse({
    schema: { properties: { is_verified: { type: 'boolean' } } },
  })
  async verifyOTP(@Body() payload: OTPPayloadDto) {
    const isVerified = await this.otpService.verify(
      payload.otp_id,
      payload.code
    );
    return { is_verified: isVerified };
  }
}
