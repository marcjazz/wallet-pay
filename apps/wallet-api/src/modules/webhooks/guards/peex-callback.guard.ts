import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Usually we use Express here

@Injectable()
export class PeexCallbackGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Basic ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header'
      );
    }

    const base64Credentials = authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    );
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw new UnauthorizedException('Invalid Basic Authentication token');
    }

    const isRequestValid = await this.validateCredentials(username, password);

    if (!isRequestValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return true;
  }

  private async validateCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    const validUsername = this.configService.get('PEEX_USERNAME', 'peex');
    const validPassword = this.configService.get(
      'PEEX_PASSWORD',
      'peex_callback'
    );

    return username === validUsername && password === validPassword;
  }
}
