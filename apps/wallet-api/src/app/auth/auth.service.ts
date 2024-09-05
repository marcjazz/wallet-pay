import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokensDto, SignUpDto } from './auth.dto';
import { IJWTPayload, TokenType } from './auth';

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_TYPE: TokenType = 'access_token';
  private static readonly REFRESH_TOKEN_TYPE: TokenType = 'refresh_token';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}

  async validateUser(
    request: Request,
    username: string,
    password: string
  ): Promise<Express.User> {
    const person = await this.prismaService.person.findFirst({
      where: { OR: [{ email: username }, { username }] },
    });
    if (person && bcrypt.compareSync(password, person.password)) {
      const origin = request.headers.origin;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, person_id, ...personData } = person;

      const personHasRole = await this.prismaService.personHasRole.findFirst({
        where: { Role: { subdomain: origin }, person_id },
      });

      if (!personHasRole || !origin) {
        throw new UnauthorizedException('Invalid request origin!');
      }

      if (!personHasRole.is_active) {
        throw new UnauthorizedException('Account was disabled!');
      }

      return {
        ...personData,
        person_id,
        subdomain: origin,
        id: personHasRole.person_has_role_id,
      };
    }

    throw new UnauthorizedException('Incorrect email or password!');
  }

  async registerUser(
    { password, ...payload }: SignUpDto,
    roleId: string,
    createdBy?: string
  ): Promise<Express.User> {
    const user = await this.prismaService.person.findUnique({
      where: { email: payload.email },
    });
    if (user) throw new ConflictException('Email address already taken!');

    const {
      PersonHasRoles: [
        {
          person_has_role_id,
          Role: { subdomain },
        },
      ],
      ...person
    } = await this.prismaService.person.create({
      include: {
        PersonHasRoles: { select: { person_has_role_id: true, Role: true } },
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
      },
    });
    return { ...person, id: person_has_role_id, subdomain };
  }

  async login(user: Express.User): Promise<AuthTokensDto> {
    if (!user.isVerified) {
      // await this.otpService.sendOTP(user.phoneNumber);
    }
    return this.generateTokens(user);
  }

  private async generateTokens(user: Express.User) {
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh_token' },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }
    );
    const accessToken = this.jwtService.sign(
      { sub: user.id, type: 'access_token' },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      }
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

  async authorizeToken(
    authzToken: string,
    type: TokenType = AuthService.ACCESS_TOKEN_TYPE
  ): Promise<Express.User> {
    let payload: IJWTPayload;
    try {
      payload = this.jwtService.verify(authzToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new ForbiddenException(
        `Error validating token (type: ${type}): ${error.message}`
      );
    }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Person: { password, ...person },
      Role: { subdomain },
    } = personHasRole;

    return { ...person, subdomain, id: payload.sub };
  }

  extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new ForbiddenException('No access token found!');
    }

    return token;
  }
}
