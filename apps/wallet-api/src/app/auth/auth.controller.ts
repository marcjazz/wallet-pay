import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserEntity } from '../../modules/users/user.dto';
import { OTPCodeDto, OTPEntity } from '../two-fa/dto/two-fa.dto';
import { TwoFAUsage } from '../two-fa/two-fa.interface';
import { SkipAuth } from './auth.decorator';
import {
  AccessTokenResponse,
  AuthTokensDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';

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
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('sign-in')
  @UseGuards(LocalGuard)
  @ApiBody({ type: SignInDto })
  @ApiCreatedResponse({ type: AccessTokenResponse })
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
  async signIn(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.login(req.user as Express.User);
    // Set new Http-Only cookies
    this.setCookies(tokens, res);

    res.status(HttpStatus.CREATED).json(
      new AccessTokenResponse({
        expires_in: 900000, // 15 minutes
        token_type: 'Bearer',
        issued_at: tokens.issued_at,
        access_token: tokens.access_token,
      })
    );
  }

  @Post('sign-up')
  @ApiCreatedResponse({ type: AccessTokenResponse })
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiConflictResponse({
    description:
      'Conflict, user email is already registered with another account.',
  })
  async signUp(@Body() newUser: SignUpDto, @Res() res: Response) {
    const user = await this.authService.registerUser(newUser);

    const tokens = await this.authService.login(user);
    // Set new Http-Only cookies
    this.setCookies(tokens, res);

    res.status(HttpStatus.CREATED).json(
      new AccessTokenResponse({
        expires_in: 900000, // 15 minutes
        token_type: 'Bearer',
        issued_at: tokens.issued_at,
        access_token: tokens.access_token,
      })
    );
  }

  @Post('forgot-password')
  @ApiCreatedResponse({ type: OTPEntity })
  @ApiOperation({
    summary: 'Request for reset password OTP.',
  })
  async requestTwoFA(@Body() payload: ForgotPasswordDto) {
    const otp = await this.authService.requestForgotPasswordOTP(payload.email);
    return new OTPEntity({ ...otp, usage: otp.usage as TwoFAUsage });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authService.resetPassword(payload);
  }

  @Post('refresh')
  @ApiCreatedResponse({ type: AccessTokenResponse })
  @ApiOperation({
    summary: 'Request for new access token.',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token; // Get from Http-Only cookie
    if (!refreshToken) {
      res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
        message: 'Refresh token not found!',
        path: req.url,
      });
    }

    const tokens = await this.authService.refreshAuthTokens(refreshToken);
    // Set new Http-Only cookies
    this.setCookies(tokens, res);

    res.status(HttpStatus.CREATED).json(
      new AccessTokenResponse({
        expires_in: 900000, // 15 minutes
        token_type: 'Bearer',
        issued_at: tokens.issued_at,
        access_token: tokens.access_token,
      })
    );
  }

  @SkipAuth(false)
  @ApiBearerAuth()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserEntity })
  async verifyEmail(@Req() req: Request, @Body() otpPayload: OTPCodeDto) {
    const user = req.user as Express.User;
    await this.authService.verifyEmail(otpPayload.code, user);

    return new UserEntity({ ...user, user_id: user.id });
  }

  @Post('logout')
  @SkipAuth(false)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    schema: { properties: { messaage: { type: 'string' } } },
  })
  @ApiOperation({
    summary: 'Close user session.',
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    //update database
    await this.authService.logout(req.user?.id as string);

    // clear credentials from cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  private setCookies(tokens: AuthTokensDto, res: Response) {
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
