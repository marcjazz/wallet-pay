import { type ConfigurationParameters } from '@cybrid/cybrid-api-bank-typescript';
type NewCybridCustomerType = {
  cybrid_account_guid: string;
  cybrid_customer_guid: string;
};

type CybridConfigParams = ConfigurationParameters & {
  scope: string;
};

type CybridAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
};
