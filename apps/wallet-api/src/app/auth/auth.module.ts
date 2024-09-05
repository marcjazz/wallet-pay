import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';

@Module({
  imports: [JwtModule],
  providers: [AuthService, RolesService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
