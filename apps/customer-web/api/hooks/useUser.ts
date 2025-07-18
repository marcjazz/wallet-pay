'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { UserService } from '../services/UserService';
import { UserEntity, UpdateProfileDto } from '../types';
import { errorHandling } from '../../components/shared/errorHandling';
import { useIntl } from 'react-intl';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const userService = new UserService(apiClient);

/**
 * Hook for fetching the user's profile.
 */
export const useUserProfile = () => {
  const { formatMessage } = useIntl();

  const tt = useQuery<UserEntity, Error>({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });
  const { isError, error } = tt;
  if (isError) errorHandling({ error, formatMessage });

  return tt;
};

/**
 * Hook for updating the user's profile.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserEntity, Error, UpdateProfileDto>({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
