import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TwoFAModule } from '../two-fa/two-fa.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { LocalStrategy } from './local/local.strategy';
import { RolesService } from './roles.service';
import { CybridModule } from '../../cybrid/cybrid.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TwoFAModule,
    CybridModule.forRoot({
      username: process.env.CYBRID_CLIENT_ID,
      password: process.env.CYBRID_CLIENT_SECRET,
    }),
  ],
  providers: [AuthService, RolesService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
