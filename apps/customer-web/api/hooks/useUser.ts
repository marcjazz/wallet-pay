'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { UserService } from '../services/UserService';
import { UserEntity, UpdateProfileDto } from '../types';

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

/**
 * Hook for updating the user's profile.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UserEntity, Error, UpdateProfileDto>({
    mutationKey: ['updateProfile'],
    mutationFn: (payload) => userService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      // Update the cached user profile
      queryClient.setQueryData(['userProfile'], updatedUser);
    },
  });
};
