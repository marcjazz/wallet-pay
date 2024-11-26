import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { OtpService } from '../services/OtpService';
import { OTPEntity, OTPUsageDto } from '../types';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const otpService = new OtpService(apiClient);

/**
 * Hook for requesting an OTP.
 */
export const useRequestOtp = () =>
  useMutation<OTPEntity, Error, OTPUsageDto>({
    mutationKey: ['requestOtp'],
    mutationFn: (payload) => otpService.requestOtp(payload),
  });
