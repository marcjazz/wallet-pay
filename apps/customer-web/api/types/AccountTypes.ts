import {
    AccountType,
    Currency,
    ExternalAccountStatus,
    VerificationStatus,
} from './EnumTypes';

/**
 * Entity representing a Cybrid account.
 */
export interface CybridAccountEntity {
  /** Unique ID for the Cybrid account. */
  cybrid_account_id: string;
  /** Name of the account. */
  name: string;
  /** Account balance. */
  balance: number;
  /** Verification status of the account. */
  verification_status: VerificationStatus | null;
  /** Globally unique account GUID. */
  cybrid_account_guid: string;
  /** Identity verification GUID, if applicable. */
  identity_verification_guid?: string | null;
  /** Currency code. */
  currency: Currency;
  /** Whether the account is active. */
  is_active: boolean;
  /** Customer ID associated with the account. */
  cybrid_customer_id: string;
}

/**
 * Entity representing an external bank account.
 */
export interface ExternalBankAccountEntity {
  /** Unique ID for the Cybrid external account. */
  cybrid_external_account_id: string;
  /** Globally unique external account GUID. */
  cybrid_external_account_guid: string;
  /** Name of the external bank account. */
  name: string;
  /** Account balance. */
  balance: number;
  /** Masked account number, if applicable. */
  mask?: string | null;
  /** Status of the external bank account. */
  status: ExternalAccountStatus;
  /** Identity verification GUID, if applicable. */
  identity_verification_guid?: string | null;
  /** Verification status of the external bank account. */
  verification_status?: VerificationStatus | null;
  /** Customer ID associated with the account. */
  cybrid_customer_id: string;
}

/**
 * DTO for verifying a Cybrid account.
 */
export interface VerifyCybridAccountDto {
  /** Type of account being verified. */
  account_type: AccountType;
  /** External bank account ID, required if the account type is "external". */
  external_bank_account_id?: string;
}

/**
 * Entity representing the result of an identity verification.
 */
export interface IdentityVerificationEntity {
  /** Unique GUID for the identity verification. */
  identity_verification_guid: string;
  /** GUID for the customer associated with the verification. */
  customer_guid: string;
  /** Current state of the verification. */
  state: VerificationStatus;
  /** External bank account ID, if applicable. */
  external_bank_account_id?: string | null;
  /** Persona inquiry ID for completing identity verification. */
  persona_inquiry_id?: string | null;
  /** Hosted link for Persona identity verification completion. */
  persona_hosted_link?: string | null;
}

/**
 * DTO for initiating a Plaid connection workflow.
 */
export interface CreateWorkflowDto {
  /** Redirect URI for the Plaid link flow. Optional when type is "plaid". */
  redirect_uri?: string;
}

/**
 * DTO for creating a new external bank account from Plaid data.
 */
export interface CreateExternalAccountDto {
  /** Public token from Plaid. */
  plaid_public_token: string;
  /** Account ID returned by Plaid. */
  plaid_account_id: string;
  /** Masked account number returned by Plaid. */
  plaid_account_mask: string;
  /** Currency of the account. */
  currency: Currency;
}

/**
 * DTO for verifying a Cybrid account.
 */
export interface VerifyCybridAccountDto {
  /** Type of account being verified. */
  account_type: AccountType;
  /** External bank account ID, required if the account type is "external". */
  external_bank_account_id?: string;
}

/**
 * Entity representing the result of an identity verification.
 */
export interface IdentityVerificationEntity {
  /** Unique GUID for the identity verification. */
  identity_verification_guid: string;
  /** GUID for the customer associated with the verification. */
  customer_guid: string;
  /** Current state of the verification. */
  state: VerificationStatus;
  /** External bank account ID, if applicable. */
  external_bank_account_id?: string | null;
  /** Persona inquiry ID for completing identity verification. */
  persona_inquiry_id?: string | null;
  /** Hosted link for Persona identity verification completion. */
  persona_hosted_link?: string | null;
}

/**
 * DTO for initiating a Plaid connection workflow.
 */
export interface CreateWorkflowDto {
  /** Redirect URI for the Plaid link flow. Optional when type is "plaid". */
  redirect_uri?: string;
}

/**
 * DTO for creating a new external bank account from Plaid data.
 */
export interface CreateExternalAccountDto {
  /** Public token from Plaid. */
  plaid_public_token: string;
  /** Account ID returned by Plaid. */
  plaid_account_id: string;
  /** Masked account number returned by Plaid. */
  plaid_account_mask: string;
  /** Currency of the account. */
  currency: Currency;
}
