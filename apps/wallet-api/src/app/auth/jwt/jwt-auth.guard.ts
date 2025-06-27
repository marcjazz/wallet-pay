import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { MetadataEnum } from '../auth.decorator';
import { Request } from 'express';

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

    const isAuthorizedRoute = [
      'auth',
      'users',
      'currencies',
      'otp/request',
    ].some((path) => request.url.includes(path));

    // TODO: Remove this check when launch priod end
    if (!user.is_pilot_user && !isAuthorizedRoute) {
      throw new ForbiddenException('Platform not available to all yet!');
    }

    const request = context.switchToHttp().getRequest<Request>();
    if (!user.is_verified && !isAuthorizedRoute) {
      throw new ForbiddenException('Unverified email!');
    }

    return user as TUser;
  }
}
