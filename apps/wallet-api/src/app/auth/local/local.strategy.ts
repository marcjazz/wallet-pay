import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(request: Request, email: string, password: string) {
    const user = await this.authService.validateUser(request, email, password);

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password!');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account was disabled!');
    }

    return user;
  }
}
