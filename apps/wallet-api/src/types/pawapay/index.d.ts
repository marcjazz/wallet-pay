/**
 * Interface for payout rejection reason details.
 */
export interface PawapayRejectionReason {
  /** The specific reason code for payout rejection. */
  rejectionCode: PayoutRejectionCode;
  /** Optional additional message explaining the rejection. */
  rejectionMessage?: string;
}

/**
 * Interface for the payout response.
 */
export interface PawapayPayoutResponse {
  /** The unique identifier of the payout transaction. */
  payoutId: string; // UUID with a required length of 36
  /** The current status of the payout initiation. */
  status: PayoutStatus;
  /** The timestamp when the payout was created, formatted as RFC3339 date-time. */
  created: string;
  /** The reason for rejection, if the payout was rejected. */
  rejectionReason?: PawapayRejectionReason;
}
