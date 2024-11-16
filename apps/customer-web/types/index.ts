export enum ExternalAccountVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
}

export enum RemittanceStep {
  amount = 1,
  recipient = 2,
  summary = 3,
}

export enum TransactionStatus {
  PROCESSING = 'PENDING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
}
