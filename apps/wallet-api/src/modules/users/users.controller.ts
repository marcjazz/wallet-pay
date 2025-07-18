import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  Req, 
  UnauthorizedException,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOkResponse, 
  ApiTags, 
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserEntity, UpdateProfileDto } from './user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ type: UserEntity, description: 'User profile retrieved successfully' })
  getProfile(@Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not connected!');
    }

    return new UserEntity({ ...user, user_id: user.id });
  }

  @Patch('profile')
  @ApiOperation({ 
    summary: 'Update user profile',
    description: `Update user profile information. Note:
    - email and phone_number are always editable
    - first_name, last_name, and birthdate can only be edited if account is not cybrid verified
    - Once cybrid verified, attempting to update restricted fields will result in 403 Forbidden`
  })
  @ApiOkResponse({ 
    type: UserEntity, 
    description: 'Profile updated successfully' 
  })
  @ApiForbiddenResponse({ 
    description: 'Cannot update restricted fields - account is cybrid verified' 
  })
  @ApiNotFoundResponse({ 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not connected!');
    }

    const updatedPerson = await this.usersService.updateProfile(
      req.user.id, 
      updateProfileDto
    );

    const { person_id, ...userWithoutPersonId } = updatedPerson;
    return new UserEntity({
      ...userWithoutPersonId,
      user_id: user.id,
      person_id,
      is_active: user.is_active,
    });
  }
}
