export enum CybridKycState {
  STORING = ' storing',
  WAITING = 'waiting',
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

export enum CybridCustomerState {
  STORING = 'storing',
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  FROZEN = 'frozen',
}