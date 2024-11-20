import { TransactionStatus, TransactionType, TransferType } from './enums';
import { OTPPayloadDto } from './OTP.type';
import { ReceiverPayoutInfoDto } from './Receiver.type';

/**
 * DTO for initiating a transfer.
 */
export interface InitiateTransferDto {
  /** Unique ID of the source account for the transfer. */
  cybrid_source_account_id: string;
  /** Type of transfer being initiated. */
  transfer_type: TransferType;
  /** Currency code for the transfer (e.g., USD, CAD). */
  currency: string;
  /** Amount to be transferred. */
  amount: number;
  /** OTP details for verification. */
  otp: OTPPayloadDto;
  /** Receiver payout information. */
  receiver: ReceiverPayoutInfoDto;
}

/**
 * Entity representing a transaction.
 */
export interface CybridTransactionEntity {
  /** Unique ID for the transaction. */
  cybrid_transaction_id: string;
  /** GUID for the transaction. */
  cybrid_transaction_guid: string;
  /** Transaction amount. */
  amount: number;
  /** Type of transaction. */
  transaction_type: TransactionType;
  /** Current status of the transaction. */
  status: TransactionStatus;
  /** Timestamp when the transaction was initiated. */
  initiated_at: string;
  /** Timestamp when the transaction was settled, if applicable. */
  settled_at: string | null;
  /** Full name of the recipient, if applicable. */
  reciepient_fullname?: string;
}
