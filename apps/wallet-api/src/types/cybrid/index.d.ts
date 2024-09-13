import type {
  AccountBankModel,
  ConfigurationParameters,
  IdentityVerificationBankModel,
} from '@cybrid/cybrid-api-bank-typescript';

export type NewCybridCustomerType = {
  cybrid_account_guid: string;
  cybrid_customer_guid: string;
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
  identity_verfication?: IdentityVerificationBankModel;
};
