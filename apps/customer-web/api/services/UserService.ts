import { ApiClient } from './ApiClient';
import { UserEntity, UpdateProfileDto } from '../types';

/**
 * Service for user-related API calls.
 */
export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getProfile(): Promise<UserEntity> {
    return this.apiClient.get<UserEntity>('/api/v1/users/profile');
  }

  async updateProfile(data: UpdateProfileDto): Promise<UserEntity> {
    return this.apiClient.patch<UserEntity>('/api/v1/users/profile', data);
  }
}
