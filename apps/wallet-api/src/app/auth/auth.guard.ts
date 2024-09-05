import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MetadataEnum } from './auth.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.get<boolean>(
      MetadataEnum.IS_PUBLIC,
      context.getHandler()
    );

    if (isPublic) return isPublic;
    const isAuthenticated = request.isAuthenticated();
    const requestOrigin = request.headers.origin;
    if (!isAuthenticated || !requestOrigin) {
      throw new ForbiddenException('Protected resources!');
    }

    const authzToken = this.authService.extractTokenFromHeader(request);
    const authorizedUser = await this.authService.authorizeToken(authzToken);

    const origin = new URL(requestOrigin).host;
    if (authorizedUser.subdomain !== origin) {
      throw new ForbiddenException('Invalid request origin!');
    }

    // const roles = this.reflector.getAllAndOverride<RoleEnum[] | null>(
    //   MetadataEnum.ROLES,
    //   [context.getHandler(), context.getClass()]
    // );

    request.user = authorizedUser;
    return isAuthenticated;
  }
}
