import { OTPEntity, OTPUsageDto } from '../types';
import { ApiClient } from './ApiClient';

export class OtpService {
  constructor(private apiClient: ApiClient) {}

  async requestOtp(payload: OTPUsageDto): Promise<OTPEntity> {
    return await this.apiClient.post('/api/v1/two-fa/otp/request', payload);
  }

  async resendOTP(otpId: string): Promise<OTPEntity> {
    return await this.apiClient.patch(`/api/v1/two-fa/otp/${otpId}/resend`);
  }
}
