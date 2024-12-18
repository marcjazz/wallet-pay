import {
  AccessTokenResponse,
  ForgotPasswordDto,
  OTPEntity,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '../types';
import { ApiClient } from './ApiClient';

/**
 * Service for authentication-related API calls.
 */
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async signIn(payload: SignInDto): Promise<AccessTokenResponse> {
    const tokenResp = await this.apiClient.post<AccessTokenResponse>(
      '/api/v1/auth/sign-in',
      payload
    );
    this.apiClient.setAuthToken(tokenResp); // Set token for future requests
    return tokenResp;
  }

  async signUp(payload: SignUpDto): Promise<AccessTokenResponse> {
    const tokenResp = await this.apiClient.post<AccessTokenResponse>(
      '/api/v1/auth/sign-up',
      payload
    );
    this.apiClient.setAuthToken(tokenResp); // Set token for future requests
    return tokenResp;
  }

  async verifyEmail(payload: { code: string }): Promise<void> {
    await this.apiClient.post('/api/v1/auth/verify-email', payload);
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<OTPEntity> {
    return await this.apiClient.post('/api/v1/auth/forgot-password', payload);
  }

  async resetPassword(payload: ResetPasswordDto): Promise<void> {
    await this.apiClient.post('/api/v1/auth/reset-password', payload);
  }

  async logOut(): Promise<void> {
    await this.apiClient.post('/api/v1/auth/logout', {});
    this.apiClient.clearAuthToken(); // Clear token
  }
}
