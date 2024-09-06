import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ITwoFAService, TWoFAUsage } from '../two-fa.interface';
import { generateOtp } from '../../../helpers/otp-generator';

@Injectable()
export class OTPService implements ITwoFAService<string> {
  constructor(private prismaService: PrismaService) {}

  async request(userId: string, usage: TWoFAUsage): Promise<string> {
    const otp = await this.prismaService.oTP.create({
      data: {
        code: generateOtp(5),
        usage,
        PersonHasRole: { connect: { person_has_role_id: userId } },
      },
    });

    return otp.code;
  }

  async verify(id: string, otpCode: string): Promise<boolean> {
    const otp = await this.prismaService.oTP.findUnique({
      where: { otp_id: id },
    });

    return !!otp && otp.code === otpCode && otp.is_valid;
  }
}
