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
        PersonHasRole: { connect: { person_has_role_id: userId } },
      },
    });

    return otp;
  }

  async verify(id: string, otpCode: string): Promise<boolean> {
    const otp = await this.prismaService.oTP.findUnique({
      where: { otp_id: id },
    });

    return !!otp && otp.code === otpCode && otp.is_valid;
  }
}
