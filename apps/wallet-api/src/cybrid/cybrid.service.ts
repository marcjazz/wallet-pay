import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CustomerBankModel,
  ExternalBankAccountBankModel,
  ExternalBankAccountListBankModel,
  ExternalBankAccountsBankApi,
  IdentityVerificationBankModel,
  IdentityVerificationsBankApi,
  IdentityVerificationWithDetailsBankModel,
  PostAccountBankModelTypeEnum,
  PostCustomerBankModelTypeEnum,
  PostExternalBankAccountBankModelAccountKindEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
  PostQuoteBankModelProductTypeEnum,
  PostTransferBankModel,
  PostWorkflowBankModelKindEnum,
  PostWorkflowBankModelTypeEnum,
  QuoteBankModel,
  QuotesBankApi,
  TransferBankModel,
  TransfersBankApi,
  WorkflowBankModel,
  WorkflowsBankApi,
  WorkflowWithDetailsBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { Queue } from 'bull';
import { NewCybridCustomerType } from '../types/cybrid';
import { cybridConstants, cybridJobs } from './constants';
import { CybridConfiguration } from './cybrid.config';

@Injectable()
export class CybridService {
  constructor(
    @InjectQueue(cybridConstants.QUEUE)
    private cybridQueue: Queue,
    private readonly cybridConfiguration: CybridConfiguration
  ) {}

  async getCustomers() {
    const customersBankApi = await this.cybridConfiguration.getCustomersApi();
    const observable = customersBankApi.listCustomers({});
    return new Promise((resolve) => observable.subscribe(resolve));
  }

  async getCustomer(guid: string) {
    const customersBankApi = await this.cybridConfiguration.getCustomersApi(
      guid,
      ['customers:read']
    );
    const observable = customersBankApi.getCustomer({
      customerGuid: guid,
    });
    return new Promise<CustomerBankModel>((resolve) =>
      observable.subscribe(resolve)
    );
  }

  async createCustomer(
    asset: CybridSupportedCurrency
  ): Promise<NewCybridCustomerType> {
    const customersBankApi = await this.cybridConfiguration.getCustomersApi();

    const newCustomerObservable = customersBankApi.createCustomer({
      postCustomerBankModel: { type: PostCustomerBankModelTypeEnum.Individual },
    });
    return new Promise<NewCybridCustomerType>((resolve) => {
      return newCustomerObservable.subscribe(async (customer) => {
        // Pulling customer creation status from cybrid to update database
        this.cybridQueue.add(
          cybridJobs.PULLING_CYBRID_CUSTOMER,
          customer.guid,
          { backoff: { type: 'exponential', delay: 3000 } }
        );

        const accountsBankApi = await this.cybridConfiguration.getInstance(
          AccountsBankApi,
          customer.guid as string,
          ['accounts:execute', 'accounts:read']
        );

        const newAccountObservable = accountsBankApi.createAccount({
          postAccountBankModel: {
            asset,
            name: `${asset} Account`,
            customer_guid: customer.guid,
            type: PostAccountBankModelTypeEnum.Fiat,
          },
        });

        const account = await new Promise<AccountBankModel>((resolve) =>
          newAccountObservable.subscribe(resolve)
        );

        resolve({ account, customer });
      });
    });
  }

  async getIdentityVerification(
    customerGuid: string,
    identityVerificationGuid: string
  ) {
    const identityVerificationsApi = await this.cybridConfiguration.getInstance(
      IdentityVerificationsBankApi,
      customerGuid,
      ['identity_verifications:read']
    );

    const getIdentityVerificationObservable =
      identityVerificationsApi.getIdentityVerification({
        identityVerificationGuid,
      });
    return new Promise<IdentityVerificationWithDetailsBankModel>((resolve) =>
      getIdentityVerificationObservable.subscribe(resolve)
    );
  }

  async createIdentityVerification(customerGuid: string) {
    const identityVerificationsApi = await this.cybridConfiguration.getInstance(
      IdentityVerificationsBankApi,
      customerGuid,
      ['identity_verifications:write', 'identity_verifications:read']
    );

    const newIndentityVerficationObservable =
      identityVerificationsApi.createIdentityVerification({
        postIdentityVerificationBankModel: {
          customer_guid: customerGuid,
          type: PostIdentityVerificationBankModelTypeEnum.Kyc,
          method: PostIdentityVerificationBankModelMethodEnum.IdAndSelfie,
        },
      });
    const identityVerfication =
      await new Promise<IdentityVerificationBankModel>((resolve) =>
        newIndentityVerficationObservable.subscribe(resolve)
      );

    // Pulling identity verification status from cybrid to update database
    this.cybridQueue.add(
      cybridJobs.PULLING_CUSTOMER_IDENTITY_VERIFICATION,
      [customerGuid, identityVerfication.guid],
      {
        backoff: { type: 'exponential', delay: 5000 },
      }
    );
    return identityVerfication;
  }

  async getAccount(customerGuid: string, accountGuid: string) {
    const accountsBankApi = await this.cybridConfiguration.getInstance(
      AccountsBankApi,
      customerGuid,
      ['accounts:read']
    );

    const accountObservable = accountsBankApi.getAccount({ accountGuid });

    return new Promise<AccountBankModel>((resolve) =>
      accountObservable.subscribe(resolve)
    );
  }

  async getAccounts(customerGuid: string) {
    const accountsBankApi = await this.cybridConfiguration.getInstance(
      AccountsBankApi,
      customerGuid,
      ['accounts:read']
    );

    const accountObservable = accountsBankApi.listAccounts({
      customerGuid,
      type: PostAccountBankModelTypeEnum.Fiat,
    });

    return new Promise<AccountListBankModel>((resolve) =>
      accountObservable.subscribe(resolve)
    );
  }

  async createWorkflow(customerGuid: string) {
    const workflowsBankApi = await this.cybridConfiguration.getInstance(
      WorkflowsBankApi,
      customerGuid,
      ['workflows:execute']
    );
    const workflowObservable = workflowsBankApi.createWorkflow({
      postWorkflowBankModel: {
        customer_guid: customerGuid,
        type: PostWorkflowBankModelTypeEnum.Plaid,
        kind: PostWorkflowBankModelKindEnum.Create,
      },
    });

    return new Promise<WorkflowBankModel>((resolve) =>
      workflowObservable.subscribe(resolve)
    );
  }

  async getWorkflow(customerGuid: string, workflowGuid: string) {
    const workflowsBankApi = await this.cybridConfiguration.getInstance(
      WorkflowsBankApi,
      customerGuid,
      ['workflows:read']
    );
    const workflowObservable = workflowsBankApi.getWorkflow({
      workflowGuid,
    });
    return new Promise<WorkflowWithDetailsBankModel>((resolve) =>
      workflowObservable.subscribe(resolve)
    );
  }

  async createExternalBankAccount(
    customerGuid: string,
    plaidAccountId: string,
    plaidPublicToken: string,
    asset: CybridSupportedCurrency
  ) {
    const externalBankAccountsApi = await this.cybridConfiguration.getInstance(
      ExternalBankAccountsBankApi,
      customerGuid,
      ['external_bank_accounts:write']
    );
    const externalBankAccountObservable =
      externalBankAccountsApi.createExternalBankAccount({
        postExternalBankAccountBankModel: {
          asset,
          customer_guid: customerGuid,
          name: `${asset} Funding Account`,
          plaid_account_id: plaidAccountId,
          plaid_public_token: plaidPublicToken,
          account_kind: PostExternalBankAccountBankModelAccountKindEnum.Plaid,
        },
      });
    return new Promise<ExternalBankAccountBankModel>((resolve) => {
      externalBankAccountObservable.subscribe(async (externalAccount) => {
        const identityVerificationsApi =
          await this.cybridConfiguration.getInstance(
            IdentityVerificationsBankApi,
            customerGuid,
            ['identity_verifications:write']
          );

        const identityVerificationObservable =
          identityVerificationsApi.createIdentityVerification({
            postIdentityVerificationBankModel: {
              type: PostIdentityVerificationBankModelTypeEnum.BankAccount,
              method:
                PostIdentityVerificationBankModelMethodEnum.AccountOwnership,
              customer_guid: customerGuid,
              external_bank_account_guid: externalAccount.guid,
            },
          });
        identityVerificationObservable.subscribe((identityVerfication) => {
          this.cybridQueue.add(
            cybridJobs.PULLING_EXTERNAL_ACCOUNT_IDENTITY_VERIFICATION,
            [customerGuid, identityVerfication.guid],
            { backoff: { type: 'exponential', delay: 3000 } }
          );
        });
        resolve(externalAccount);
      });
    });
  }

  async getExternalBankAccount(
    customerGuid: string,
    externalBankAccountGuid: string
  ) {
    const externalBankAccountsApi = await this.cybridConfiguration.getInstance(
      ExternalBankAccountsBankApi,
      customerGuid,
      ['external_bank_accounts:read']
    );

    const externalBankAccountObservable =
      externalBankAccountsApi.getExternalBankAccount({
        externalBankAccountGuid,
      });
    return new Promise<ExternalBankAccountBankModel>((resolve) =>
      externalBankAccountObservable.subscribe(resolve)
    );
  }

  async getExternalBankAccounts(customerGuid: string) {
    const externalBankAccountsApi = await this.cybridConfiguration.getInstance(
      ExternalBankAccountsBankApi,
      customerGuid,
      ['external_bank_accounts:read']
    );

    const externalBankAccountObservable =
      externalBankAccountsApi.listExternalBankAccounts({
        customerGuid,
      });
    return new Promise<ExternalBankAccountListBankModel>((resolve) =>
      externalBankAccountObservable.subscribe(resolve)
    );
  }

  async createQuote(
    customerGuid: string,
    product_type: PostQuoteBankModelProductTypeEnum,
    amount: number,
    asset: CybridSupportedCurrency
  ) {
    const quotesBankApi = await this.cybridConfiguration.getInstance(
      QuotesBankApi,
      customerGuid,
      ['quotes:execute']
    );

    const quotesBankObservable = quotesBankApi.createQuote({
      postQuoteBankModel: {
        asset,
        product_type,
        customer_guid: customerGuid,
        receive_amount: amount,
      },
    });

    return new Promise<QuoteBankModel>((resolve) =>
      quotesBankObservable.subscribe(resolve)
    );
  }

  async initiateTransfer(customerGuid: string, payload: PostTransferBankModel) {
    const transfersBankApi = await this.cybridConfiguration.getInstance(
      TransfersBankApi,
      customerGuid,
      ['transfers:execute']
    );

    const transfersObservable = transfersBankApi.createTransfer({
      postTransferBankModel: payload,
    });

    return new Promise<TransferBankModel>((resolve) =>
      transfersObservable.subscribe((transfer) => {
        this.cybridQueue.add(
          cybridJobs.PULLING_CYBRID_TRANSFER,
          [customerGuid, payload.fiat_account_guid, transfer.guid],
          { backoff: { type: 'exponential', delay: 3000 } } // should be set to 24 hour in production
        );
        resolve(transfer);
      })
    );
  }

  async getTransfer(customerGuid: string, transferGuid: string) {
    const transfersBankApi = await this.cybridConfiguration.getInstance(
      TransfersBankApi,
      customerGuid,
      ['transfers:read']
    );

    const transfersObservable = transfersBankApi.getTransfer({
      transferGuid,
    });

    return new Promise<TransferBankModel>((resolve) =>
      transfersObservable.subscribe(resolve)
    );
  }
}
