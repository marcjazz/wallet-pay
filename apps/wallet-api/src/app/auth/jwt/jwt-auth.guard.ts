import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { MetadataEnum } from '../auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      MetadataEnum.IS_PUBLIC,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) return isPublic;
    return super.canActivate(context);
  }

  handleRequest<TUser = Express.User>(
    err: unknown,
    user: Express.User,
    info: unknown,
    context: ExecutionContext
  ): TUser {
    if (err || info) {
      throw err || new ForbiddenException('Invalid bearer token!');
    }

    const request: Request = this.getRequest(context);
    const requestOrigin = request.headers.origin;

    if (!requestOrigin || user.subdomain !== new URL(requestOrigin).host) {
      throw new ForbiddenException('Invalid request origin!');
    }

    return user as TUser;
  }
}
