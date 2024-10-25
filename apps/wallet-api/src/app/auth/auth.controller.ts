import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  PreconditionFailedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OTPEntity } from '../two-fa/dto/two-fa.dto';
import { TwoFAUsage } from '../two-fa/two-fa.interface';
import { RoleEnum, SkipAuth } from './auth.decorator';
import {
  AuthTokensDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';
import { RolesService } from './roles.service';

@SkipAuth()
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
    const subdomain = new URL(req.headers.origin as string).host;

    const role = await this.rolesService.findByTitleAndSubdomain(
      RoleEnum.CLIENT,
      subdomain
    );
    if (!role) {
      throw new PreconditionFailedException('Could not resolve user role');
    }

    const user = await this.authService.registerUser(newUser, role.role_id);
    return this.authService.login(user);
  }

  @Post('forgot-password')
  @ApiCreatedResponse({ type: OTPEntity })
  async requestTwoFA(@Req() req: Request, @Body() payload: ForgotPasswordDto) {
    const otp = await this.authService.requestForgotPasswordOTP(
      req,
      payload.email
    );
    return new OTPEntity({ ...otp, usage: otp.usage as TwoFAUsage });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authService.resetPassword(payload);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Request for new access token.',
  })
  @ApiCreatedResponse({ type: AuthTokensDto })
  async requestAccessToken(
    @Body() payload: RefreshTokenDto
  ): Promise<AuthTokensDto> {
    return await this.authService.refreshAuthTokens(payload.refresh_token);
  }
}
