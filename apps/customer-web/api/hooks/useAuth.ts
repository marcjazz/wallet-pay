'use client';

import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { AuthService } from '../services/AuthService';
import {
  AccessTokenResponse,
  OTPEntity,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '../types';

const apiClient = ApiClient.getInstance(API_BASE_URL);
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

export const useVerifyEmail = () =>
  useMutation<void, Error, { code: string }>({
    mutationKey: ['verifyEmail'],
    mutationFn: (payload) => authService.verifyEmail(payload),
  });

export const useForgotPassword = () =>
  useMutation<OTPEntity, Error, { email: string }>({
    mutationKey: ['forgotPassword'],
    mutationFn: (payload) => authService.forgotPassword(payload),
  });

export const useResetPassword = () =>
  useMutation<void, Error, ResetPasswordDto>({
    mutationKey: ['resetPassword'],
    mutationFn: (payload) => authService.resetPassword(payload),
  });

export const useLogOut = () => {
  return useMutation<void, Error, void>({
    mutationKey: ['logOut'],
    mutationFn: () => authService.logOut(),
  });
};
