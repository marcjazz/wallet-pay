import {
  Body,
  Controller,
  Get,
  Post,
  PreconditionFailedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RoleEnum } from './auth.decorator';
import { AuthTokensDto, SignInDto, SignUpDto } from './auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { PersonEntity } from '../../modules/persons/person.dto';

@Controller('auth')
@ApiTags('Authentication')
@ApiBadRequestResponse({
  description:
    'Bad request. This often happens when the request payload it not respected.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error. An unexpected exception was thrown',
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService
  ) {}

  @Post('sign-in')
  @UseGuards(LocalGuard)
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 201, type: AuthTokensDto })
  @ApiOperation({
    summary: 'Sign in to authenticate a user',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized request. incorrect email or password',
  })
  @ApiPreconditionFailedResponse({
    description:
      'Precondition failed, user account must be activated before signing in.',
  })
  async signIn(@Req() req: Request) {
    return this.authService.login(req.user as Express.User);
  }

  @Post('sign-up')
  @ApiResponse({ status: 201, type: AuthTokensDto })
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiConflictResponse({
    description:
      'Conflict, user email is already registered with another account.',
  })
  async signUp(@Req() req: Request, @Body() newUser: SignUpDto) {
    const role = await this.rolesService.findByTitleAndSubdomain(
      RoleEnum.CLIENT,
      req.headers.origin as string
    );
    if (!role) {
      throw new PreconditionFailedException('Could not resolve user role');
    }

    const user = await this.authService.registerUser(newUser, role.role_id);
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: PersonEntity })
  getProfile(@Req() req: Request) {
    return new PersonEntity(req.user);
  }
}
