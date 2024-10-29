import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OTPService } from '../../app/two-fa/otp/otp.service';
import { TwoFAUsage } from '../../app/two-fa/two-fa.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly otpService: OTPService
  ) {}

  async verifyEmail(otpCode: string, user: Express.User) {
    //Find the first `verified_email` otp record successfully verified in the past 60s
    const otp = await this.prismaService.oTP.findFirst({
      orderBy: { created_at: 'desc' },
      where: {
        person_has_role_id: user.id,
        usage: TwoFAUsage.VERIFY_EMAIL,
      },
    });
    if (!otp) {
      throw new NotFoundException(
        'No valid OTP request was found! Please request for a new one.'
      );
    }

    const isVerified = await this.otpService.verify(
      otp.otp_id,
      otpCode,
      TwoFAUsage.VERIFY_EMAIL
    );

    if (!isVerified) {
      throw new UnauthorizedException(`Invalid one time password!`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, is_active, created_at, person_id, ...person } = user;
    await this.prismaService.person.update({
      data: {
        is_verified: true,
        PersonAudits: {
          create: {
            ...person,
            AuditedBy: { connect: { person_has_role_id: user.id } },
          },
        },
      },
      where: { email: user.email },
    });
  }
}
