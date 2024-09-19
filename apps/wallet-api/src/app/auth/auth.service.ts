import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CybridAccountType,
  CybridSupportedCurrency,
  SupportedLocalCurrency,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CybridService } from '../../cybrid/cybrid.service';
import { generateAccountNumber } from '../../helpers/otp-generator';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from '../two-fa/otp/otp.service';
import { TwoFAUsage } from '../two-fa/two-fa.interface';
import { AuthTokensDto, ResetPasswordDto, SignUpDto } from './auth.dto';
import { IJWTPayload, TokenType } from './jwt/jwt.strategy';

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
    private readonly cybridService: CybridService
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
        where: { Role: { subdomain }, person_id: person.person_id },
      });

      if (subdomain && personHasRole?.is_active) {
        return {
          ...person,
          subdomain,
          is_active: personHasRole.is_active,
          id: personHasRole.person_has_role_id,
        };
      }
    }
    return null;
  }

  async registerUser(
    { password, country, ...payload }: SignUpDto,
    roleId: string,
    createdBy?: string
  ): Promise<Express.User> {
    const { cybrid_account_guid, cybrid_customer_guid } =
      await this.cybridService.createCustomer(CybridSupportedCurrency.USD);
    const user = await this.prismaService.person.findUnique({
      where: { email: payload.email },
    });
    if (user) throw new ConflictException('Email address already taken!');

    const {
      PersonHasRoles: [
        {
          is_active,
          person_has_role_id,
          Role: { subdomain },
        },
      ],
      ...person
    } = await this.prismaService.person.create({
      include: {
        PersonHasRoles: {
          include: { Role: true },
        },
      },
      data: {
        ...payload,
        password: bcrypt.hashSync(
          password,
          bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS))
        ),
        PersonHasRoles: {
          create: {
            Role: { connect: { role_id: roleId } },
            CreatedBy: createdBy
              ? { connect: { person_has_role_id: createdBy } }
              : undefined,
          },
        },
        LocalCustomers: {
          create: {
            balance: 0,
            currency: SupportedLocalCurrency.XAF,
            account_number: generateAccountNumber(),
          },
        },
        CybridCustomers: {
          create: {
            country,
            cybrid_customer_guid,
            CybridAccounts: {
              create: {
                cybrid_account_guid,
                account_type: CybridAccountType.FIAT,
                currency: CybridSupportedCurrency.USD,
              },
            },
          },
        },
      },
    });

    return { ...person, id: person_has_role_id, subdomain, is_active };
  }

  async login(user: Express.User): Promise<AuthTokensDto> {
    if (!user.is_verified) {
      this.logger.debug(`Request otp for user...`);

      const otpCode = await this.otpService.request(
        user.id,
        TwoFAUsage.VERIFY_EMAIL
      );

      await this.mailerService.sendText({
        to: `${user.first_name} <${user.email}>`,
        subject: 'Email Verification',
        text: `Your One time password is ${otpCode}`,
      });

      this.logger.debug(`Successfully sent requested otp user!`);
    }
    return this.generateTokens(user);
  }

  private async generateTokens(user: Express.User) {
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: AuthService.REFRESH_TOKEN_TYPE },
      { expiresIn: '7d' }
    );
    const accessToken = this.jwtService.sign(
      { sub: user.id, type: AuthService.ACCESS_TOKEN_TYPE },
      { expiresIn: '1h' }
    );

    await this.prismaService.log.create({
      data: {
        refresh_token: refreshToken,
        PersonHasRole: { connect: { person_has_role_id: user.id } },
      },
    });
    return new AuthTokensDto({
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  }

  async validateToken(
    payload: IJWTPayload,
    type: TokenType = AuthService.ACCESS_TOKEN_TYPE
  ): Promise<Express.User> {
    if (payload.type !== type) {
      throw new ForbiddenException('Invalid token type!');
    }

    const personHasRole = await this.prismaService.personHasRole.findUnique({
      include: { Person: true, Role: true },
      where: { person_has_role_id: payload.sub },
    });
    if (!personHasRole) {
      throw new NotFoundException('Invalid token payload!');
    }
    const {
      Person: person,
      is_active,
      Role: { subdomain },
    } = personHasRole;

    return { ...person, subdomain, is_active, id: payload.sub };
  }

  async requestForgotPasswordOTP(request: Request, username: string) {
    const subdomain = new URL(request.headers.origin as string).host;

    const user = await this.prismaService.personHasRole.findFirst({
      include: { Person: true },
      where: {
        Role: { subdomain },
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
    await this.mailerService.sendText({
      to: `${person.first_name} <${person.email}>`,
      subject: 'Forgot password OTP',
      text: `Your verification code is ${otp.code}. Use OTP to sign-in and change your password`,
    });

    return otp;
  }

  async resetPassword({ otp_code, otp_id, password }: ResetPasswordDto) {
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
          password,
          bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS))
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
}
