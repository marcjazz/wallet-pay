export enum TwoFAUsage {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export enum TwoFAEnum {
  OTP = 'otp',
}

export interface ITwoFAService<TData> {
  request: (userId: string, usage: TwoFAUsage) => Promise<TData> | TData;
  verify: (id: string, data: unknown) => Promise<boolean> | boolean;
}
