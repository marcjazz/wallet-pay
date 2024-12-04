/**
 * Enum for payout initiation statuses.
 */
export enum PawapayPayoutStatus {
  ACCEPTED = 'ACCEPTED', // The payout request has been accepted by pawaPay for processing.
  ENQUEUED = 'ENQUEUED', // The payout request has been accepted but enqueued for processing later.
  REJECTED = 'REJECTED', // The payout request has been rejected by pawaPay.
  DUPLICATE_IGNORED = 'DUPLICATE_IGNORED', // The payout request is a duplicate of an already accepted request.
}

/**
 * Enum for possible payout rejection codes.
 */
export enum PawapayPayoutRejectionCode {
  BALANCE_INSUFFICIENT = 'BALANCE_INSUFFICIENT', // Insufficient funds in the wallet.
  INVALID_CORRESPONDENT = 'INVALID_CORRESPONDENT', // Correspondent not supported.
  INVALID_RECIPIENT_FORMAT = 'INVALID_RECIPIENT_FORMAT', // Recipient phone number format is unrecognizable.
  INVALID_AMOUNT = 'INVALID_AMOUNT', // The specified amount is not supported.
  AMOUNT_TOO_SMALL = 'AMOUNT_TOO_SMALL', // The amount is smaller than the minimum allowed.
  AMOUNT_TOO_LARGE = 'AMOUNT_TOO_LARGE', // The amount exceeds the maximum allowed.
  INVALID_CURRENCY = 'INVALID_CURRENCY', // The currency is not supported by the correspondent.
  INVALID_COUNTRY = 'INVALID_COUNTRY', // The country is not supported for the correspondent.
  PARAMETER_INVALID = 'PARAMETER_INVALID', // One or more parameters are invalid.
  INVALID_INPUT = 'INVALID_INPUT', // Unable to parse the request payload.
  PAYOUTS_NOT_ALLOWED = 'PAYOUTS_NOT_ALLOWED', // Payouts are not allowed for the merchant or correspondent.
  CORRESPONDENT_TEMPORARILY_UNAVAILABLE = 'CORRESPONDENT_TEMPORARILY_UNAVAILABLE', // The correspondent is temporarily unavailable.
}
