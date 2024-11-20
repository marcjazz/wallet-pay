export interface ForgotPasswordDto {
  email: string; // Valid user email
}

export interface OTPUsageDto {
  usage: 'verify_email' | 'reset_password' | 'transfer';
}

export interface OTPPayloadDto {
  otp_id: string;
  code: string;
}

export interface OTPEntity {
  otp_id: string;
  usage: 'verify_email' | 'reset_password' | 'transfer';
  is_verified: boolean;
  expires_at: string; // ISO date format
  updated_at: string | null;
  created_at: string; // ISO date format
  person_has_role_id: string;
}
