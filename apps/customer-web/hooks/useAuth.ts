'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/services/ApiClient';
import { AuthService } from '../api/services/AuthService';
import { AccessTokenResponse, SignInDto, SignUpDto } from '../api/types';

//TODO: REMOVE LOCAL LINK
const apiClient = new ApiClient(
  process.env.NX_PUBLIC_API_BASE_URL ||
    'http://10.183.29.85:3000' ||
    'https://api.xafpay.com'
);
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
