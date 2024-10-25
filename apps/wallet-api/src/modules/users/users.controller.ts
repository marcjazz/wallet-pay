import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OTPCodeDto } from '../../app/two-fa/dto/two-fa.dto';
import { UserEntity } from './user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
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

  @Post('verify-email')
  @ApiOkResponse({ type: UserEntity })
  async verifyEmail(@Req() req: Request, @Body() otpPayload: OTPCodeDto) {
    if (!req.user) {
      throw new UnauthorizedException('User not connected!');
    }

    await this.usersService.verifyEmail(otpPayload.code, req.user);
    return new UserEntity({ ...req.user, user_id: req.user.id });
  }
}
