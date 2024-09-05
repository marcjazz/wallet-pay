import { faker } from '@faker-js/faker';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { MailerModule, MailerService } from '@xafpay/mailer';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CLIENT_ORIGIN } from '../../constants';

describe('AuthGuard', () => {
  let authGuard: AuthenticatedGuard;
  let reflector: Reflector;
  let prisma: PrismaService;
  let authService: AuthService;
  const role: Prisma.RoleCreateInput = {
    origin: CLIENT_ORIGIN,
    role_name: 'Client',
    role_id: faker.string.uuid(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, MailerService],
      imports: [MailerModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);

    reflector = new Reflector();
    authGuard = new AuthenticatedGuard(reflector, authService);

    await prisma.role.create({
      data: role,
    });
  });

  afterAll(async () => {
    await prisma.role.delete({
      where: { role_id: role.role_id },
    });
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should activate', async () => {
    let executionContext = {
      getHandler() {
        return {};
      },
      switchToHttp() {
        return {
          getRequest() {
            return {
              headers: { origin: 'http://localhost:4200' },
              isAuthenticated() {
                return false;
              },
            } as unknown as Request;
          },
        } as HttpArgumentsHost;
      },
    } as ExecutionContext;
    expect(await authGuard.canActivate(executionContext)).toBeFalsy();
    executionContext = {
      getHandler() {
        return {};
      },
      switchToHttp() {
        return {
          getRequest() {
            return {
              user: { role_id: role.role_id },
              headers: { origin: 'http://localhost:4200' },
              isAuthenticated() {
                return true;
              },
            } as unknown as Request;
          },
        } as HttpArgumentsHost;
      },
    } as ExecutionContext;
    expect(await authGuard.canActivate(executionContext)).toBeTruthy();
  });
});
