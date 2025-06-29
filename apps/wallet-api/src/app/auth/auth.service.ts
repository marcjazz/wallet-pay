import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { $Enums } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CybridService } from '../../cybrid/cybrid.service';
import { generateAccountNumber } from '../../helpers/otp-generator';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from '../two-fa/otp/otp.service';
import { TwoFAUsage } from '../two-fa/two-fa.interface';
import { RoleEnum } from './auth.decorator';
import { AuthTokensDto, ResetPasswordDto, SignUpDto } from './auth.dto';
import { IJWTPayload, TokenType } from './jwt/jwt.strategy';
import { generateConfirmEmail } from '../../mailer/emails/confirm-email';
import { generateOtpCodeEmail } from '../../mailer/emails/otp-email';
import { isUserPilotActive } from '../../helpers/utils';

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_TYPE: TokenType = 'access_token';
  private static readonly REFRESH_TOKEN_TYPE: TokenType = 'refresh_token';

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly otpService: OTPService,
    private readonly cybridService: CybridService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(
    request: Request,
    username: string,
    password: string
  ): Promise<Express.User | null> {
    const person = await this.prismaService.person.findFirst({
      where: { OR: [{ email: username }, { username }] },
    });
    if (person && bcrypt.compareSync(password, person.password)) {
      const subdomain = new URL(request.headers.origin as string).host;

      this.logger.debug(`Authenticating user from origin ${subdomain}...`);

      const personHasRole = await this.prismaService.personHasRole.findFirst({
        where: { person_id: person.person_id },
      });

      if (subdomain && personHasRole?.is_active) {
        return {
          ...person,
          is_active: personHasRole.is_active,
          id: personHasRole.person_has_role_id,
        };
      }
    }
    return null;
  }

  async registerUser(
    { password, country, ...payload }: SignUpDto,
    createdBy?: string
  ): Promise<Express.User> {
    const user = await this.prismaService.person.findUnique({
      where: { email: payload.email },
    });
    if (user) throw new ConflictException('Email address already taken!');

    const { fiatAccount, cryptoAccount, customer } =
      await this.cybridService.createCustomer('USD', payload.first_name);

    const isPilotUser: boolean = isUserPilotActive(payload.email);

    const {
      PersonHasRoles: [{ is_active, person_has_role_id }],
      ...person
    } = await this.prismaService.person.create({
      include: { PersonHasRoles: true },
      data: {
        ...payload,
        is_pilot_user: isPilotUser,
        birthdate: new Date(payload.birthdate),
        password: bcrypt.hashSync(
          password,
          bcrypt.genSaltSync(
            Number(this.configService.get<number>('SALT_ROUNDS'))
          )
        ),
        PersonHasRoles: {
          create: {
            Role: { connect: { title: RoleEnum.CLIENT } },
            CreatedBy: createdBy
              ? { connect: { person_has_role_id: createdBy } }
              : undefined,
          },
        },
        LocalCustomers: {
          create: {
            balance: 0,
            currency: 'XAF',
            account_number: generateAccountNumber(),
          },
        },
        CybridCustomers: {
          create: {
            country,
            status:
              customer.state?.toLocaleUpperCase() as $Enums.CybridCustomerStatus,
            cybrid_customer_guid: customer.guid as string,
            CybridAccounts: {
              createMany: {
                data: [
                  {
                    currency:
                      fiatAccount.asset as $Enums.CybridSupportedCurrency,
                    cybrid_account_guid: fiatAccount.guid as string,
                    name: fiatAccount.name as string,
                    balance: (fiatAccount.platform_available ?? 0) / 100,
                  },
                  {
                    currency:
                      cryptoAccount.asset as $Enums.CybridSupportedCurrency,
                    name: cryptoAccount.name as string,
                    cybrid_account_guid: cryptoAccount.guid as string,
                    balance: (cryptoAccount.platform_available ?? 0) / 1e6,
                  },
                ],
                skipDuplicates: true,
              },
            },
          },
        },
      },
    });

    return { ...person, id: person_has_role_id, is_active };
  }

  async login(user: Express.User): Promise<AuthTokensDto> {
    let otpId: string | undefined;
    if (!user.is_verified) {
      this.logger.debug(`Request otp for user...`);

      const otpCode = await this.otpService.request(
        user.id,
        TwoFAUsage.VERIFY_EMAIL
      );
      otpId = otpCode.otp_id;

      const receiver = `${user.first_name} <${user.email}>`;
      await this.mailerService.sendMessage({
        to: receiver,
        subject: 'Email Verification',
        html: generateConfirmEmail({
          customerName: receiver,
          otpCode: otpCode.code,
        }),
      });

      this.logger.debug(`Successfully sent requested otp user!`);
    }

    // create login log
    await this.prismaService.log.create({
      data: { PersonHasRole: { connect: { person_has_role_id: user.id } } },
    });

    return this.generateTokens(user.id, otpId);
  }

  private async generateTokens(userId: string, otpId?: string) {
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: AuthService.REFRESH_TOKEN_TYPE },
      { expiresIn: '7d' }
    );
    const accessToken = this.jwtService.sign(
      { sub: userId, type: AuthService.ACCESS_TOKEN_TYPE },
      { expiresIn: '15m' }
    );

    return new AuthTokensDto({
      refresh_token: refreshToken,
      access_token: accessToken,
      issued_at: Date.now(),
      otp_id: otpId,
    });
  }

  async validateJwtPayload(
    payload: IJWTPayload,
    type: TokenType = AuthService.ACCESS_TOKEN_TYPE
  ): Promise<Express.User> {
    if (payload.type !== type) {
      throw new UnprocessableEntityException('Invalid token type!');
    }

    const personHasRole = await this.prismaService.personHasRole.findUnique({
      include: { Person: true },
      where: { person_has_role_id: payload.sub },
    });
    if (!personHasRole) {
      throw new NotFoundException('Invalid token payload!');
    }
    const { Person: person, is_active } = personHasRole;

    return { ...person, is_active, id: payload.sub };
  }

  async requestForgotPasswordOTP(username: string) {
    const user = await this.prismaService.personHasRole.findFirst({
      include: { Person: true },
      where: {
        Person: { OR: [{ email: username }, { username }] },
      },
    });

    if (!user) {
      throw new NotFoundException('No such email or username!');
    }

    const otp = await this.otpService.request(
      user.person_has_role_id,
      TwoFAUsage.RESET_PASSWORD
    );

    const person = user.Person;
    await this.mailerService.sendMessage({
      to: `${person.first_name} <${person.email}>`,
      subject: 'Forgot Password OTP',
      text: `Your verification code is ${otp.code}. Use OTP to sign-in and change your password`,
      html: generateOtpCodeEmail({ otpCode: otp.code }),
    });

    return otp;
  }

  async resetPassword({ otp_code, otp_id, new_password }: ResetPasswordDto) {
    const user = await this.prismaService.personHasRole.findFirst({
      include: { Person: true },
      where: { OTPs: { some: { otp_id } } },
    });
    if (!user) {
      throw new NotFoundException('OTP request not found!');
    }

    const {
      person_has_role_id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Person: { created_at, person_id, ...personAudit },
    } = user;

    const isVerified = await this.otpService.verify(otp_id, otp_code);
    if (!isVerified) {
      throw new UnauthorizedException('Invalid otp code!');
    }

    await this.prismaService.person.update({
      data: {
        password: bcrypt.hashSync(
          new_password,
          bcrypt.genSaltSync(
            Number(this.configService.get<number>('SALT_ROUNDS'))
          )
        ),
        PersonAudits: {
          create: {
            ...personAudit,
            AuditedBy: { connect: { person_has_role_id } },
          },
        },
      },
      where: { email: personAudit.email },
    });
  }

  async refreshAuthTokens(refreshToken: string) {
    let payload: IJWTPayload;
    const type = AuthService.REFRESH_TOKEN_TYPE;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException(
        `Error validating token (type: ${type}): ${error.message}`
      );
    }

    if (payload.type !== type) {
      throw new UnauthorizedException('Invalid  bearer token type!');
    }

    // find lastest log
    const log = await this.prismaService.log.findFirst({
      orderBy: { login_at: 'desc' },
      where: {
        logout_at: null,
        person_has_role_id: payload.sub,
      },
    });

    if (!log) {
      throw new UnauthorizedException('Invalid token payload!');
    }

    // Generate new tokens
    return this.generateTokens(payload.sub);
  }

  async logout(userId: string) {
    await this.prismaService.log.updateMany({
      data: { logout_at: new Date() },
      where: { person_has_role_id: userId, logout_at: null },
    });
  }

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
    const { id, is_active, created_at, person_id, is_pilot_user, ...person } =
      user;
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
