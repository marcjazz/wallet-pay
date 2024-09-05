import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IJWTPayload, TokenType } from './auth';
import { AuthTokensDto, SignUpDto } from './auth.dto';

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
  ): Promise<Express.User | null> {
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

      if (origin && personHasRole?.is_active) {
        return {
          ...personData,
          person_id,
          subdomain: origin,
          is_active: personHasRole.is_active,
          id: personHasRole.person_has_role_id,
        };
      }
    }
    return null;
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
      },
    });
    return { ...person, id: person_has_role_id, subdomain, is_active };
  }

  async login(user: Express.User): Promise<AuthTokensDto> {
    if (!user.isVerified) {
      // await this.otpService.sendOTP(user.phoneNumber);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Person: { password, ...person },
      is_active,
      Role: { subdomain },
    } = personHasRole;

    return { ...person, subdomain, is_active, id: payload.sub };
  }
}
