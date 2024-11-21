import {
  AccessTokenResponse,
  ForgotPasswordDto,
  SignInDto,
  SignUpDto
} from '../types';
import { ApiClient } from './ApiClient';

/**
 * Service for authentication-related API calls.
 */
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async signIn(payload: SignInDto): Promise<AccessTokenResponse> {
    const tokens = await this.apiClient.post<AccessTokenResponse>(
      '/api/v1/auth/sign-in',
      payload
    );
    this.apiClient.setAuthToken(tokens.access_token); // Set token for future requests
    return tokens;
  }

  async signUp(payload: SignUpDto): Promise<AccessTokenResponse> {
    return this.apiClient.post<AccessTokenResponse>(
      '/api/v1/auth/sign-up',
      payload
    );
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<void> {
    await this.apiClient.post('/api/v1/auth/forgot-password', payload);
  }

  async refreshToken(): Promise<AccessTokenResponse> {
    return this.apiClient.post<AccessTokenResponse>('/api/v1/auth/refresh', {});
  }
}
