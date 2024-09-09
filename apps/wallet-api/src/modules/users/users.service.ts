import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TwoFAUsage } from '../../app/two-fa/two-fa.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async verifyEmail(user: Express.User) {
    //Find the first `verified_email` otp record successfully verified in the past 60s
    const otp = await this.prismaService.oTP.findFirst({
      where: {
        is_verified: true,
        usage: TwoFAUsage.VERIFY_EMAIL,
        updated_at: { lte: new Date(Date.now() - 60_000) },
      },
    });

    if (!otp) {
      throw new NotFoundException(
        `No valid records was found for 2FA usage ${TwoFAUsage.VERIFY_EMAIL}`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, subdomain, is_active, created_at, person_id, ...person } = user;
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
