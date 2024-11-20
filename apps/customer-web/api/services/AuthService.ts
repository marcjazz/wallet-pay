import { ApiClient } from './ApiClient';
import {
  SignInDto,
  AuthTokensDto,
  SignUpDto,
  ForgotPasswordDto,
} from '../types';

/**
 * Service for authentication-related API calls.
 */
export class AuthenticationService {
  constructor(private apiClient: ApiClient) {}

  async signIn(payload: SignInDto): Promise<AuthTokensDto> {
    const tokens = await this.apiClient.post<AuthTokensDto>(
      '/api/v1/auth/sign-in',
      payload
    );
    this.apiClient.setAuthToken(tokens.access_token); // Set token for future requests
    return tokens;
  }

  async signUp(payload: SignUpDto): Promise<AuthTokensDto> {
    return this.apiClient.post<AuthTokensDto>('/api/v1/auth/sign-up', payload);
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<void> {
    await this.apiClient.post('/api/v1/auth/forgot-password', payload);
  }
}
