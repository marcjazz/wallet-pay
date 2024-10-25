import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CustomerBankModel,
  CustomerListBankModel,
  ExternalBankAccountBankModel,
  ExternalBankAccountListBankModel,
  ExternalBankAccountsBankApi,
  IdentityVerificationBankModel,
  IdentityVerificationsBankApi,
  IdentityVerificationWithDetailsBankModel,
  PostAccountBankModelTypeEnum,
  PostCustomerBankModelTypeEnum,
  PostExternalBankAccountBankModel,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
  PostQuoteBankModelProductTypeEnum,
  PostTransferBankModel,
  PostTransferBankModelTransferTypeEnum,
  PostWorkflowBankModelKindEnum,
  PostWorkflowBankModelLanguageEnum,
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
    return new Promise<CustomerListBankModel>((next, error) =>
      observable.subscribe({ next, error })
    );
  }

  async getCustomer(guid: string) {
    const customersBankApi = await this.cybridConfiguration.getCustomersApi(
      guid,
      ['customers:read']
    );
    const observable = customersBankApi.getCustomer({
      customerGuid: guid,
    });
    return new Promise<CustomerBankModel>((next, error) =>
      observable.subscribe({ next, error })
    );
  }

  async createCustomer(
    asset: CybridSupportedCurrency
  ): Promise<NewCybridCustomerType> {
    const customersBankApi = await this.cybridConfiguration.getCustomersApi();

    const newCustomerObservable = customersBankApi.createCustomer({
      postCustomerBankModel: { type: PostCustomerBankModelTypeEnum.Individual },
    });
    return new Promise<NewCybridCustomerType>((resolve, error) => {
      return newCustomerObservable.subscribe({
        error,
        next: async (customer) => {
          // Pulling customer creation status from cybrid to update database
          await this.cybridQueue.add(
            cybridJobs.PULLING_CYBRID_CUSTOMER,
            customer.guid,
            { backoff: { type: 'exponential', delay: 3000 } }
          );

          const accountsBankApi = await this.cybridConfiguration.getInstance(
            AccountsBankApi,
            customer.guid as string,
            ['accounts:execute']
          );

          const newAccountObservable = accountsBankApi.createAccount({
            postAccountBankModel: {
              asset,
              name: `${asset} Account`,
              customer_guid: customer.guid,
              type: PostAccountBankModelTypeEnum.Fiat,
            },
          });

          const account = await new Promise<AccountBankModel>((next, error) =>
            newAccountObservable.subscribe({ next, error })
          );

          resolve({ account, customer });
        },
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
    return new Promise<IdentityVerificationWithDetailsBankModel>(
      (next, error) =>
        getIdentityVerificationObservable.subscribe({ next, error })
    );
  }

  async verifyCybridAccount(
    customerGuid: string,
    externalBankAccountGuid?: string
  ) {
    const identityVerificationsApi = await this.cybridConfiguration.getInstance(
      IdentityVerificationsBankApi,
      customerGuid,
      ['identity_verifications:execute']
    );

    const newIndentityVerficationObservable =
      identityVerificationsApi.createIdentityVerification({
        postIdentityVerificationBankModel: {
          customer_guid: customerGuid,
          ...(externalBankAccountGuid
            ? {
                type: PostIdentityVerificationBankModelTypeEnum.BankAccount,
                method:
                  PostIdentityVerificationBankModelMethodEnum.AccountOwnership,
                external_bank_account_guid: externalBankAccountGuid,
              }
            : {
                type: PostIdentityVerificationBankModelTypeEnum.Kyc,
                method: PostIdentityVerificationBankModelMethodEnum.IdAndSelfie,
              }),
        },
      });
    const identityVerfication =
      await new Promise<IdentityVerificationBankModel>((next, error) =>
        newIndentityVerficationObservable.subscribe({ next, error })
      );

    // Pulling identity verification status from cybrid to update database
    await this.cybridQueue.add(
      externalBankAccountGuid
        ? cybridJobs.PULLING_EXTERNAL_ACCOUNT_IDENTITY_VERIFICATION
        : cybridJobs.PULLING_CUSTOMER_IDENTITY_VERIFICATION,
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

    return new Promise<AccountBankModel>((next, error) =>
      accountObservable.subscribe({ next, error })
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

    return new Promise<AccountListBankModel>((next, error) =>
      accountObservable.subscribe({ next, error })
    );
  }

  async createWorkflow(customerGuid: string, redirectUri?: string) {
    const workflowsBankApi = await this.cybridConfiguration.getInstance(
      WorkflowsBankApi,
      customerGuid,
      ['workflows:execute']
    );
    const workflowObservable = workflowsBankApi.createWorkflow({
      postWorkflowBankModel: {
        redirect_uri: redirectUri,
        customer_guid: customerGuid,
        type: PostWorkflowBankModelTypeEnum.Plaid,
        kind: PostWorkflowBankModelKindEnum.Create,
        language: PostWorkflowBankModelLanguageEnum.En,
        link_customization_name: 'default',
      },
    });

    return new Promise<WorkflowBankModel>((next, error) =>
      workflowObservable.subscribe({ next, error })
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
    return new Promise<WorkflowWithDetailsBankModel>((next, error) =>
      workflowObservable.subscribe({ next, error })
    );
  }

  async createExternalBankAccount(
    customerGuid: string,
    payload: PostExternalBankAccountBankModel
  ) {
    const externalBankAccountsApi = await this.cybridConfiguration.getInstance(
      ExternalBankAccountsBankApi,
      customerGuid,
      ['external_bank_accounts:execute']
    );
    const externalBankAccountObservable =
      externalBankAccountsApi.createExternalBankAccount({
        postExternalBankAccountBankModel: {
          ...payload,
          customer_guid: customerGuid,
        },
      });
    return new Promise<ExternalBankAccountBankModel>((next, error) =>
      externalBankAccountObservable.subscribe({ error, next })
    );
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
    return new Promise<ExternalBankAccountBankModel>((next, error) =>
      externalBankAccountObservable.subscribe({ next, error })
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
    return new Promise<ExternalBankAccountListBankModel>((next, error) =>
      externalBankAccountObservable.subscribe({ next, error })
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
        side:
          product_type == PostQuoteBankModelProductTypeEnum.Funding
            ? 'deposit'
            : undefined,
      },
    });

    return new Promise<QuoteBankModel>((next, error) =>
      quotesBankObservable.subscribe({ next, error })
    );
  }

  async initiateTransfer(customerGuid: string, payload: PostTransferBankModel) {
    const transfersBankApi = await this.cybridConfiguration.getInstance(
      TransfersBankApi,
      customerGuid,
      ['transfers:execute']
    );

    const transfersObservable = transfersBankApi.createTransfer({
      postTransferBankModel: { ...payload, customer_guid: customerGuid },
    });

    return new Promise<TransferBankModel>((resolve, error) =>
      transfersObservable.subscribe({
        error,
        next: async (transfer) => {
          // Book transfers are nearly instant and there by don't need to be pulled
          if (
            payload.transfer_type != PostTransferBankModelTransferTypeEnum.Book
          ) {
            await this.cybridQueue.add(
              cybridJobs.PULLING_CYBRID_TRANSFER,
              [customerGuid, payload.fiat_account_guid, transfer.guid],
              { backoff: { type: 'exponential', delay: 3000 } } // should be set to 24 hour in production
            );
          }

          resolve(transfer);
        },
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

    return new Promise<TransferBankModel>((next, error) =>
      transfersObservable.subscribe({ next, error })
    );
  }
}
