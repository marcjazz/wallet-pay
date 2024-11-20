'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/services/ApiClient';
import { AuthService } from '../api/services/AuthService';
import { AuthTokensDto, SignInDto, SignUpDto } from '../api/types';

const apiClient = new ApiClient('https://api.xafpay.com');
const authService = new AuthService(apiClient);

/**
 * Hook for user sign-in.
 */
export const useSignIn = () =>
  useMutation<AuthTokensDto, Error, SignInDto>({
    onMutate: (payload) => authService.signIn(payload),
  });

/**
 * Hook for user sign-up.
 */
export const useSignUp = () =>
  useMutation<AuthTokensDto, Error, SignUpDto>({
    onMutate: (payload) => authService.signUp(payload),
  });
