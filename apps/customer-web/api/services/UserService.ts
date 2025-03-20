import { ApiClient } from './ApiClient';
import { UserEntity } from '../types';

/**
 * Service for user-related API calls.
 */
export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getProfile(): Promise<UserEntity> {
    return this.apiClient.get<UserEntity>('/api/v1/users/profile');
  }
}
