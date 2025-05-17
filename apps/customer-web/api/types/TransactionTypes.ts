import { TransactionStatus, TransactionType } from './EnumTypes';
import { OTPPayloadDto } from './OTPTypes';
import { ReceiverPayoutInfoDto } from './ReceiverTypes';

export interface InitiateFundingTransferDto {
  /** Unique ID of the source account for the transfer. */
  cybrid_source_account_id: string;
  /** Amount to be transferred. */
  amount: number;
  /** OTP details for verification. */
  otp: OTPPayloadDto;
}

/**
 * DTO for initiating a transfer.
 */
export interface InitiateRemittanceTransferDto
  extends InitiateFundingTransferDto {
  /** Receiver payout information. */
  receiver: ReceiverPayoutInfoDto;
}

/**
 * Entity representing a transaction.
 */
export interface CybridTransactionEntity {
  /** Unique ID for the transaction. */
  cybrid_transaction_id: string;
  /** Globally unique transaction GUID. */
  cybrid_transaction_guid: string;
  /** Transaction amount on Sol network. */
  amount: number;
  /** Transaction amount on Sol network. */
  initial_currency_amount: number;
  /** Currency of the transaction: USDC_SOL. */
  currency: string;
  /** Initial currency of the transaction. */
  initial_currency?: string | null;
  /** Conversion rate for the transaction, if applicable. */
  conversion_rate?: number | null;
  /** Transaction fees. */
  fees: number;
  /** External transaction ID. */
  transaction_id: string;
  /** Type of transaction. */
  transaction_type: TransactionType;
  /** Current status of the transaction. */
  status: TransactionStatus;
  /** Timestamp when the transaction was initiated. */
  initiated_at: string;
  /** Timestamp when the transaction was settled, if applicable. */
  settled_at?: string | null;
  /** Local customer ID for local transactions, if applicable. */
  local_customer_id?: string | null;
  /** ID of the source Cybrid account. */
  cybrid_account_id?: string;
  /** ID of the source external account. */
  cybrid_external_account_id?: string;
  /** Payout info ID for the receiver, if applicable. */
  receiver_payout_info_id?: string | null;
  /** Bank payout info ID for the receiver's bank, if applicable. */
  receiver_bank_payout_info_id?: string | null;
  /** Full name of the recipient, if applicable. */
  recipient_fullname?: string | null;
  /** Withdrawal transaction ID. */
  withdrawal_transaction_id?: string | null;
  /** Cybrid crypto account ID. */
  cybrid_crypto_account_id?: string | null;
  /** Remittance payout reference. */
  remittance_payout_ref?: string | null;
  /** Payout at. */
  payout_at?: string | null;
}
