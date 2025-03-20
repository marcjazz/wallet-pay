import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ITwoFAService, TwoFAUsage } from '../two-fa.interface';
import { generateOtp } from '../../../helpers/otp-generator';
import { OTP } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OTPService implements ITwoFAService<OTP> {
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async request(userId: string, usage: TwoFAUsage): Promise<OTP> {
    const otp = await this.prismaService.oTP.create({
      data: {
        usage,
        code:
          this.configService.get('NODE_ENV') === 'test'
            ? '55555'
            : generateOtp(5),
        expires_at: new Date(Date.now() + 300_000), // 5min validity
        PersonHasRole: { connect: { person_has_role_id: userId } },
      },
    });

    return otp;
  }

  async resend(userId: string, otpId: string): Promise<OTP> {
    const otp = await this.prismaService.oTP.update({
      data: {
        code:
          this.configService.get('NODE_ENV') === 'test'
            ? '55555'
            : generateOtp(5),
        expires_at: new Date(Date.now() + 300_000), // 5min validity
      },
      where: { otp_id: otpId, person_has_role_id: userId },
    });

    return otp;
  }

  async verify(
    id: string,
    otpCode: string,
    usage?: TwoFAUsage
  ): Promise<boolean> {
    const otp = await this.prismaService.oTP.findUnique({
      where: { otp_id: id, is_verified: false, expires_at: { gt: new Date() } },
    });

    if (!otp || otp.code !== otpCode || (usage && usage !== otp.usage)) {
      return false;
    }

    await this.prismaService.oTP.update({
      data: { is_verified: true, updated_at: new Date() },
      where: { otp_id: id },
    });
    return true;
  }
}
