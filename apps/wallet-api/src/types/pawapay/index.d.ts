import {
  PawapayPayoutRejectionCode,
  PawapayPayoutStatus,
  RecipientType,
} from './enum';

/**
 * Interface for payout rejection reason details.
 */
export interface PawapayRejectionReason {
  /** The specific reason code for payout rejection. */
  rejectionCode: PawapayPayoutRejectionCode;
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
  status: PawapayPayoutStatus;
  /** The timestamp when the payout was created, formatted as RFC3339 date-time. */
  created: string;
  /** The reason for rejection, if the payout was rejected. */
  rejectionReason?: PawapayRejectionReason;
}

/**
 * Interface for recipient details.
 */
interface Recipient {
  /** The type of recipient (e.g., MSISDN). */
  type: RecipientType;
  /** The address details of the recipient. */
  address: {
    /** The recipient's address value (e.g., phone number). */
    value: string;
  };
}

/**
 * Interface for metadata fields.
 */
interface MetadataField {
  /** The name of the metadata field. */
  fieldName: string;
  /** The value of the metadata field. */
  fieldValue: string;
  /** Indicates if the field contains personally identifiable information (PII). */
  isPII?: boolean;
}

/**
 * Interface for the payout request body.
 */
interface PawapayPayoutRequestBody {
  /** The payout amount. */
  amount: string | number;
  /** A unique identifier for the payout transaction. */
  payoutId: string;
  /** The currency in which the payout is made. */
  currency: 'XAF';
  /** The correspondent handling the payout. */
  correspondent: Correspondent;
  /** The recipient details. */
  recipient: Recipient;
  /** The timestamp when the customer initiated the payout. */
  customerTimestamp: string;
  /** A description added to the statement for the payout. */
  statementDescription: string;
  /** The country associated with the payout. */
  country: 'CMR';
  /** Additional metadata related to the payout. */
  metadata: MetadataField[];
}

/**
 * Interface for correspondent IDs.
 */
interface CorrespondentIds {
  [key: string]: string; // Key-value pairs for correspondent IDs.
}

/**
 * Interface for metadata.
 */
interface Metadata {
  /** Customer identifier associated with the payout. */
  customerEmail: string;
  /** Transaction identifier associated with the payout. */
  transactionId: string;
}

/**
 * Interface for the payout response.
 */
interface PawapayPayoutEntity {
  /** The unique identifier of the payout transaction. */
  payoutId: string;
  /** The status of the payout process. */
  status: PawapayPayoutStatus;
  /** The payout amount. */
  amount: string;
  /** The currency in which the payout was made. */
  currency: string;
  /** The country associated with the payout. */
  country: string;
  /** The correspondent handling the payout. */
  correspondent: string;
  /** The recipient details. */
  recipient: Recipient;
  /** The timestamp when the customer initiated the payout. */
  customerTimestamp: string;
  /** A description added to the statement for the payout. */
  statementDescription: string;
  /** The timestamp when the payout was created. */
  created: string;
  /** The timestamp when the payout was received by the recipient. */
  receivedByRecipient: string;
  /** Correspondent-specific IDs related to the payout. */
  correspondentIds: CorrespondentIds;
  /** Additional metadata related to the payout. */
  metadata: Metadata;
}

export interface PawapaySigningOptions {
  secretKey: BinaryLike | KeyLike | SignKeyObjectInput | SignPrivateKeyInput;
  alg: Algorithm;
  id?: string;
}

export type Algorithm =
  | 'rsa-v1_5-sha256'
  | 'ecdsa-p256-sha256'
  | 'ecdsa-p384-sha384'
  | 'ed25519'
  | 'hmac-sha256'
  | 'rsa-pss-sha512'
  | string;
