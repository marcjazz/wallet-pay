import {
  AccessTokenResponse,
  ForgotPasswordDto,
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

  async forgotPassword(payload: ForgotPasswordDto): Promise<void> {
    await this.apiClient.post('/api/v1/auth/forgot-password', payload);
  }

  async refreshToken(): Promise<AccessTokenResponse> {
    const tokenResp = await this.apiClient.post<AccessTokenResponse>(
      '/api/v1/auth/refresh',
      {}
    );
    this.apiClient.setAuthToken(tokenResp); // Set token for future requests
    return tokenResp;
  }
}
