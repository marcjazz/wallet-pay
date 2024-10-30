export enum CybridAccountEnum {
  FIAT = 'fiat',
  EXTERNAL = 'external',
}

export enum CybridSubcriptionEvents {
  TRADE_STORING = 'trade.storing',
  TRADE_PENDING = 'trade.pending',
  TRADE_CANCELLED = 'trade.cancelled',
  TRADE_COMPLETED = 'trade.completed',
  TRADE_SETTING = 'trade.settling',
  TRADE_FAILED = 'trade.failed',
  TRASNFER_STORING = 'transfer.storing',
  TRASNFER_PENDING = 'transfer.pending',
  TRASNFER_REVIEWING = 'transfer.reviewing',
  TRASNFER_COMPLETED = 'transfer.completed',
  TRASNFER_FAILED = 'transfer.failed',
  IDENTITY_VERIFICATION_STORING = 'identity_verification.storing',
  IDENTITY_VERIFICATION_PENDING = 'identity_verification.pending',
  IDENTITY_VERIFICATION_REVIEWING = 'identity_verification.reviewing',
  IDENTITY_VERIFICATION_WAITING = 'identity_verification.waiting',
  IDENTITY_VERIFICATION_EXPIRED = 'identity_verification.expired',
  IDENTITY_VERIFICATION_COMPLETED = 'identity_verification.completed',
}