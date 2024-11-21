'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/services/ApiClient';
import { AuthService } from '../api/services/AuthService';
import { AccessTokenResponse, SignInDto, SignUpDto } from '../api/types';

const apiClient = new ApiClient(process.env.API_BASE_URL || 'https://api.xafpay.com');
const authService = new AuthService(apiClient);

/**
 * Hook for user sign-in.
 */
export const useSignIn = () =>
  useMutation<AccessTokenResponse, Error, SignInDto>({
    mutationKey: ['singIn'],
    mutationFn: (payload) => authService.signIn(payload),
  });

/**
 * Hook for user sign-up.
 */
export const useSignUp = () =>
  useMutation<AccessTokenResponse, Error, SignUpDto>({
    mutationKey: ['singIn'],
    mutationFn: (payload) => authService.signUp(payload),
  });
