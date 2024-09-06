export enum TWoFAUsage {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export interface ITwoFAService<TData> {
  request: (userId: string, usage: TWoFAUsage) => Promise<TData> | TData;
  verify: (id: string, data: TData) => Promise<boolean> | boolean;
}
