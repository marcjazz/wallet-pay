import {
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
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
    info: unknown
  ): TUser {
    if (err || info) {
      throw err || new ForbiddenException('Invalid bearer token!');
    }

    return user as TUser;
  }
}
