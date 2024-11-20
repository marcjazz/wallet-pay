'use client';

import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/api/services/UserService';
import { UserEntity } from '@/api/types/';
import { ApiClient } from '@/api/services/ApiClient';

const apiClient = new ApiClient('https://api.xafpay.com');
const userService = new UserService(apiClient);

/**
 * Hook for fetching the user's profile.
 */
export const useUserProfile = () =>
  useQuery<UserEntity, Error>({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });
