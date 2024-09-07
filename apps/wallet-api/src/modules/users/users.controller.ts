import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserEntity } from './user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOkResponse({ type: UserEntity })
  getProfile(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not connected!');
    }

    const { id: user_id, ...user } = req.user;
    return new UserEntity({ ...user, user_id });
  }

  @Get('verify-email')
  @ApiOkResponse({ type: UserEntity })
  async verifyEmail(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not connected!');
    }

    return await this.usersService.verifyEmail(req.user);
  }
}
