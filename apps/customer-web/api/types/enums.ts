/**
 * Enum for supported countries.
 */
export enum Country {
  USA = 'USA',
  CANADA = 'CANADA',
}

/**
 * Enum for user gender options.
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

/**
 * Enum for preferred languages.
 */
export enum Language {
  EN_US = 'EN_US',
  FR = 'FR',
}

/**
 * Enum for OTP usage types.
 */
export enum OTPUsage {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
  TRANSFER = 'transfer',
}

/**
 * Enum for transfer types.
 */
export enum TransferType {
  FUNDING = 'funding',
  BOOK = 'book',
  CRYPTO = 'crypto',
  INSTANT_FUNDING = 'instant_funding',
  INTER_ACCOUNT = 'inter_account',
  LIGHTNING = 'lightning',
}

/**
 * Enum for transaction types.
 */
export enum TransactionType {
  REMITTANCE = 'REMITTANCE',
  CONVERT = 'CONVERT',
  FUNDING = 'FUNDING',
  WITHDRAWAL = 'WITHDRAWAL',
  ACCOUNT = 'ACCOUNT',
  XAF = 'XAF',
}

/**
 * Enum for transaction statuses.
 */
export enum TransactionStatus {
  STORING = 'STORING',
  REVIEWING = 'REVIEWING',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Enum for verification statuses.
 */
export enum VerificationStatus {
  STORING = 'STORING',
  WAITING = 'WAITING',
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}
