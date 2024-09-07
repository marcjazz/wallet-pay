import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ITwoFAService, TwoFAUsage } from '../two-fa.interface';
import { generateOtp } from '../../../helpers/otp-generator';
import { OTP } from '@prisma/client';

@Injectable()
export class OTPService implements ITwoFAService<OTP> {
  constructor(private prismaService: PrismaService) {}

  async request(userId: string, usage: TwoFAUsage): Promise<OTP> {
    const otp = await this.prismaService.oTP.create({
      data: {
        usage,
        code: generateOtp(5),
        expires_at: new Date(Date.now() + 120_000), // 2min validity
        PersonHasRole: { connect: { person_has_role_id: userId } },
      },
    });

    return otp;
  }

  async verify(id: string, otpCode: string): Promise<boolean> {
    const otp = await this.prismaService.oTP.findUnique({
      where: { otp_id: id, is_used: false, expires_at: { lt: new Date() } },
    });

    const isVerified = !!otp && otp.code === otpCode && !otp.is_used;
    if (!isVerified) {
      return false;
    }

    await this.prismaService.oTP.update({
      data: { is_used: true, updated_at: new Date() },
      where: { otp_id: id },
    });
    return true;
  }
}
