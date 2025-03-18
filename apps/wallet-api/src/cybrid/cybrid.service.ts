import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CounterpartiesBankApi,
  CounterpartyBankModel,
  CustomerBankModel,
  CustomerListBankModel,
  CustomersBankApi,
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
  PostQuoteBankModel,
  PostQuoteBankModelProductTypeEnum,
  PostQuoteBankModelSideEnum,
  PostTradeBankModel,
  PostTransferBankModel,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModel,
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
import { Injectable, Logger } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { NewCybridCustomerType } from '../types/cybrid';
import { CybridConfig } from './cybrid.config';

export type Participants = {
  source_participants: Array<PostTransferParticipantBankModel>;
  destination_participants: Array<PostTransferParticipantBankModel>;
};

@Injectable()
export class CybridService {
  private readonly logger = new Logger(CybridService.name);
  constructor(private readonly cybridConfig: CybridConfig) {}

  async getCustomers() {
    const customersBankApi = await this.cybridConfig.getInstance(
      CustomersBankApi,
      ['customers:read']
    );
    const observable = customersBankApi.listCustomers({ type: 'individual' });
    return new Promise<CustomerListBankModel>((next, error) =>
      observable.subscribe({ next, error })
    );
  }

  async getCustomer(guid: string) {
    const customersBankApi = await this.cybridConfig.getInstance(
      CustomersBankApi,
      ['customers:read'],
      guid
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
    const customersBankApi = await this.cybridConfig.getInstance(
      CustomersBankApi,
      ['customers:execute']
    );

    const newCustomerObservable = customersBankApi.createCustomer({
      postCustomerBankModel: { type: PostCustomerBankModelTypeEnum.Individual },
    });
    return new Promise<NewCybridCustomerType>((resolve, error) => {
      return newCustomerObservable.subscribe({
        error,
        next: async (customer) => {
          const accountsBankApi = await this.cybridConfig.getInstance(
            AccountsBankApi,
            ['accounts:execute'],
            customer.guid as string
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
      ['identity_verifications:read'],
      customerGuid
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
      ['identity_verifications:execute'],
      customerGuid
    );

    const newIndentityVerficationObservable =
      identityVerificationsApi.createIdentityVerification({
        postIdentityVerificationBankModel: {
          ...payload,
        },
      });
    return new Promise<IdentityVerificationBankModel>((next, error) =>
      newIndentityVerficationObservable.subscribe({ next, error })
    );
  }

  async getAccount(customerGuid: string, accountGuid: string) {
    const accountsBankApi = await this.cybridConfig.getInstance(
      AccountsBankApi,
      ['accounts:read'],
      customerGuid
    );

    const accountObservable = accountsBankApi.getAccount({ accountGuid });

    return new Promise<AccountBankModel>((next, error) =>
      accountObservable.subscribe({ next, error })
    );
  }

  async getAccounts(customerGuid: string) {
    const accountsBankApi = await this.cybridConfig.getInstance(
      AccountsBankApi,
      ['accounts:read'],
      customerGuid
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
      ['workflows:execute'],
      customerGuid
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
      ['workflows:read'],
      customerGuid
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
      ['external_bank_accounts:execute'],
      customerGuid
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
      ['external_bank_accounts:read'],
      customerGuid
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
      ['external_bank_accounts:read'],
      customerGuid
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
      ['quotes:execute'],
      payload.product_type !== PostQuoteBankModelProductTypeEnum.BookTransfer
        ? customerGuid
        : undefined
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
      ['transfers:execute'],
      payload.transfer_type !== PostTransferBankModelTransferTypeEnum.Book
        ? customerGuid
        : undefined
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
      ['trades:execute'],
      customerGuid
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
      ['trades:read'],
      customerGuid
    );

    const tradesObservable = tradesBankApi.getTrade({ tradeGuid });

    return new Promise<TradeBankModel>((next, error) =>
      tradesObservable.subscribe({ next, error })
    );
  }

  async getTransfer(customerGuid: string, transferGuid: string) {
    const transfersBankApi = await this.cybridConfig.getInstance(
      TransfersBankApi,
      ['transfers:read'],
      customerGuid
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
      ['counterparties:execute'],
      customerGuid
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
      ['counterparties:read'],
      customerGuid
    );

    const counterpartiesObservable = counterpartiesBankApi.getCounterparty({
      counterpartyGuid,
    });

    return new Promise<CounterpartyBankModel>((next, error) =>
      counterpartiesObservable.subscribe({ next, error })
    );
  }

  async settleXafPayUSDCFunds(
    bankGuid: string,
    externalWalletGuid: string,
    totalAmount: number,
    participants: Participants
  ) {
    const quotesBankApi = await this.cybridConfig.getInstance(QuotesBankApi, [
      'quotes:execute',
    ]);

    const quotesBankObservable = quotesBankApi.createQuote({
      postQuoteBankModel: {
        bank_guid: bankGuid,
        asset: 'USDC_SOL',
        deliver_amount: totalAmount,
        product_type: PostQuoteBankModelProductTypeEnum.CryptoTransfer,
        side: PostQuoteBankModelSideEnum.Withdrawal,
      },
    });

    return new Promise<TransferBankModel>((next) =>
      quotesBankObservable.subscribe({
        error: (error) => this.logger.error(error),
        next: async (quote) => {
          const transfersBankApi = await this.cybridConfig.getInstance(
            TransfersBankApi,
            ['transfers:execute']
          );

          const transfersObservable = transfersBankApi.createTransfer({
            postTransferBankModel: {
              ...participants,
              quote_guid: quote.guid as string,
              external_wallet_guid: externalWalletGuid,
              transfer_type: PostTransferBankModelTransferTypeEnum.Crypto,
            },
          });

          transfersObservable.subscribe({
            error: (error) => this.logger.error(error),
            next,
          });
        },
      })
    );
  }
}
