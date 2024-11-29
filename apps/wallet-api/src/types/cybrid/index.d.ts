import type {
  AccountBankModel,
  ConfigurationParameters,
  CustomerBankModel,
  IdentityVerificationBankModel,
} from '@cybrid/cybrid-api-bank-typescript';

export type NewCybridCustomerType = {
  fiatAccount: AccountBankModel;
  cryptoAccount: AccountBankModel;
  customer: CustomerBankModel;
};

export type CybridConfigParams = ConfigurationParameters & {
  scope: string;
};

export type CybridAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
};

export type CybridAccountWithKYC = AccountBankModel & {
  cybrid_account_id: string;
  identity_verfication?: IdentityVerificationBankModel;
};

export type ApiScopeType =
  | 'banks:read'
  | 'banks:write'
  | 'bank_applications:execute'
  | 'accounts:read'
  | 'accounts:execute'
  | 'counterparties:read'
  | 'counterparties:write'
  | 'counterparties:execute'
  | 'customers:read'
  | 'customers:write'
  | 'customers:execute'
  | 'prices:read'
  | 'quotes:execute'
  | 'quotes:read'
  | 'trades:execute'
  | 'trades:read'
  | 'transfers:execute'
  | 'transfers:read'
  | 'external_bank_accounts:read'
  | 'external_bank_accounts:write'
  | 'external_bank_accounts:execute'
  | 'external_wallets:read'
  | 'external_wallets:execute'
  | 'workflows:read'
  | 'workflows:execute'
  | 'deposit_addresses:read'
  | 'deposit_addresses:execute'
  | 'deposit_bank_accounts:read'
  | 'deposit_bank_accounts:execute'
  | 'invoices:read'
  | 'invoices:write'
  | 'invoices:execute'
  | 'identity_verifications:read'
  | 'identity_verifications:write'
  | 'identity_verifications:execute';
