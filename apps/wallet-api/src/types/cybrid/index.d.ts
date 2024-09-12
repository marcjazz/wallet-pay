import { type ConfigurationParameters } from '@cybrid/cybrid-api-bank-typescript';
type NewCybridCustomerType = {
  cybrid_account_guid: string;
  cybrid_customer_guid: string;
};

type CybridConfigParams = ConfigurationParameters & {
  scope: string;
};
