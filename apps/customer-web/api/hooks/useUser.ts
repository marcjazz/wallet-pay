'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { UserService } from '../services/UserService';
import { UserEntity } from '../types';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const userService = new UserService(apiClient);

/**
 * Hook for fetching the user's profile.
 */
export const useUserProfile = () =>
  useQuery<UserEntity, Error>({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });
