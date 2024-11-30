import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CounterpartiesBankApi,
  CounterpartyBankModel,
  CustomerBankModel,
  CustomerListBankModel,
  ExternalBankAccountBankModel,
  ExternalBankAccountListBankModel,
  ExternalBankAccountsBankApi,
  IdentityVerificationBankModel,
  IdentityVerificationsBankApi,
  IdentityVerificationWithDetailsBankModel,
  PostAccountBankModelTypeEnum,
  PostCounterpartyBankModel,
  PostCustomerBankModelTypeEnum,
  PostExternalBankAccountBankModel,
  PostIdentityVerificationBankModel,
  PostIdentityVerificationBankModelExpectedBehavioursEnum,
  PostQuoteBankModel,
  PostTradeBankModel,
  PostTransferBankModel,
  PostWorkflowBankModelKindEnum,
  PostWorkflowBankModelLanguageEnum,
  PostWorkflowBankModelTypeEnum,
  QuoteBankModel,
  QuotesBankApi,
  TradeBankModel,
  TradesBankApi,
  TransferBankModel,
  TransfersBankApi,
  WorkflowBankModel,
  WorkflowsBankApi,
  WorkflowWithDetailsBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { NewCybridCustomerType } from '../types/cybrid';
import { CybridConfig } from './cybrid.config';

@Injectable()
export class CybridService {
  constructor(private readonly cybridConfig: CybridConfig) {}

  async getCustomers() {
    const customersBankApi = await this.cybridConfig.getCustomersApi();
    const observable = customersBankApi.listCustomers({});
    return new Promise<CustomerListBankModel>((next, error) =>
      observable.subscribe({ next, error })
    );
  }

  async getCustomer(guid: string) {
    const customersBankApi = await this.cybridConfig.getCustomersApi(guid, [
      'customers:read',
    ]);
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
    const customersBankApi = await this.cybridConfig.getCustomersApi();

    const newCustomerObservable = customersBankApi.createCustomer({
      postCustomerBankModel: { type: PostCustomerBankModelTypeEnum.Individual },
    });
    return new Promise<NewCybridCustomerType>((resolve, error) => {
      return newCustomerObservable.subscribe({
        error,
        next: async (customer) => {
          const accountsBankApi = await this.cybridConfig.getInstance(
            AccountsBankApi,
            customer.guid as string,
            ['accounts:execute']
          );

          const fiatAccountObservable = accountsBankApi.createAccount({
            postAccountBankModel: {
              asset,
              name: `${asset} Account`,
              customer_guid: customer.guid,
              type: PostAccountBankModelTypeEnum.Fiat,
            },
          });

          const cryptoAccountObservable = accountsBankApi.createAccount({
            postAccountBankModel: {
              asset: 'USDC_SOL',
              name: `USDC (Solana) account`,
              customer_guid: customer.guid,
              type: PostAccountBankModelTypeEnum.Trading,
            },
          });

          const [fiatAccount, cryptoAccount] = await Promise.all([
            new Promise<AccountBankModel>((next, error) =>
              fiatAccountObservable.subscribe({ next, error })
            ),
            new Promise<AccountBankModel>((next, error) =>
              cryptoAccountObservable.subscribe({ next, error })
            ),
          ]);

          // Pulling latest customer state from cybrid
          customer = await this.getCustomer(customer.guid as string);

          resolve({ fiatAccount, cryptoAccount, customer });
        },
      });
    });
  }

  async getIdentityVerification(
    customerGuid: string,
    identityVerificationGuid: string
  ) {
    const identityVerificationsApi = await this.cybridConfig.getInstance(
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

  async verifyIdentity(
    customerGuid: string,
    payload: PostIdentityVerificationBankModel
  ) {
    const identityVerificationsApi = await this.cybridConfig.getInstance(
      IdentityVerificationsBankApi,
      customerGuid,
      ['identity_verifications:execute']
    );

    const newIndentityVerficationObservable =
      identityVerificationsApi.createIdentityVerification({
        postIdentityVerificationBankModel: {
          ...payload,
          expected_behaviours: [
            PostIdentityVerificationBankModelExpectedBehavioursEnum.PassedImmediately,
          ],
        },
      });
    return new Promise<IdentityVerificationBankModel>((next, error) =>
      newIndentityVerficationObservable.subscribe({ next, error })
    );
  }

  async getAccount(customerGuid: string, accountGuid: string) {
    const accountsBankApi = await this.cybridConfig.getInstance(
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
    const accountsBankApi = await this.cybridConfig.getInstance(
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
    const workflowsBankApi = await this.cybridConfig.getInstance(
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
    const workflowsBankApi = await this.cybridConfig.getInstance(
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
    const externalBankAccountsApi = await this.cybridConfig.getInstance(
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
    const externalBankAccountsApi = await this.cybridConfig.getInstance(
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
    const externalBankAccountsApi = await this.cybridConfig.getInstance(
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

  async createQuote(customerGuid: string, payload: PostQuoteBankModel) {
    const quotesBankApi = await this.cybridConfig.getInstance(
      QuotesBankApi,
      customerGuid,
      ['quotes:execute']
    );

    const quotesBankObservable = quotesBankApi.createQuote({
      postQuoteBankModel: payload,
    });

    return new Promise<QuoteBankModel>((next, error) =>
      quotesBankObservable.subscribe({ next, error })
    );
  }

  async initiateTransfer(customerGuid: string, payload: PostTransferBankModel) {
    const transfersBankApi = await this.cybridConfig.getInstance(
      TransfersBankApi,
      customerGuid,
      ['transfers:execute']
    );

    const transfersObservable = transfersBankApi.createTransfer({
      postTransferBankModel: { ...payload, customer_guid: customerGuid },
    });

    return new Promise<TransferBankModel>((next, error) =>
      transfersObservable.subscribe({ error, next })
    );
  }

  async initiateTrade(customerGuid: string, payload: PostTradeBankModel) {
    const tradesBankApi = await this.cybridConfig.getInstance(
      TradesBankApi,
      customerGuid,
      ['trades:execute']
    );

    const tradesObservable = tradesBankApi.createTrade({
      postTradeBankModel: payload,
    });

    return new Promise<TradeBankModel>((next, error) =>
      tradesObservable.subscribe({ error, next })
    );
  }

  async getTrade(customerGuid: string, tradeGuid: string) {
    const tradesBankApi = await this.cybridConfig.getInstance(
      TradesBankApi,
      customerGuid,
      ['trades:read']
    );

    const tradesObservable = tradesBankApi.getTrade({ tradeGuid });

    return new Promise<TradeBankModel>((next, error) =>
      tradesObservable.subscribe({ next, error })
    );
  }

  async getTransfer(customerGuid: string, transferGuid: string) {
    const transfersBankApi = await this.cybridConfig.getInstance(
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

  async createCounterparty(
    customerGuid: string,
    payload: PostCounterpartyBankModel
  ) {
    const counterpartiesBankApi = await this.cybridConfig.getInstance(
      CounterpartiesBankApi,
      customerGuid,
      ['counterparties:execute']
    );

    const counterpartiesObservable = counterpartiesBankApi.createCounterparty({
      postCounterpartyBankModel: { customer_guid: customerGuid, ...payload },
    });

    return new Promise<CounterpartyBankModel>((next, error) =>
      counterpartiesObservable.subscribe({ next, error })
    );
  }

  async getCounterparty(customerGuid: string, counterpartyGuid: string) {
    const counterpartiesBankApi = await this.cybridConfig.getInstance(
      CounterpartiesBankApi,
      customerGuid,
      ['counterparties:read']
    );

    const counterpartiesObservable = counterpartiesBankApi.getCounterparty({
      counterpartyGuid,
    });

    return new Promise<CounterpartyBankModel>((next, error) =>
      counterpartiesObservable.subscribe({ next, error })
    );
  }
}
