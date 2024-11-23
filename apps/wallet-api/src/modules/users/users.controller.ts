import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserEntity } from './user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get('profile')
  @ApiOkResponse({ type: UserEntity })
  getProfile(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not connected!');
    }

    const { id: user_id, ...user } = req.user;
    return new UserEntity({ ...user, user_id });
  }
}
