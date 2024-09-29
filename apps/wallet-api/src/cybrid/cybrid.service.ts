import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CustomerBankModel,
  CustomersBankApi,
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
  PostWorkflowBankModelKindEnum,
  PostWorkflowBankModelTypeEnum,
  WorkflowBankModel,
  WorkflowsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { Queue } from 'bull';
import { NewCybridCustomerType } from '../types/cybrid';
import { cybridConstants, cybridJobs } from './constants';

@Injectable()
export class CybridService {
  constructor(
    @InjectQueue(cybridConstants.QUEUE)
    private cybridQueue: Queue,
    private readonly customersBankApi: CustomersBankApi,
    private readonly accountsBankApi: AccountsBankApi,
    private readonly identityVerificationsApi: IdentityVerificationsBankApi,
    private readonly workflowsBankApi: WorkflowsBankApi,
    private readonly externalBankAccountsApi: ExternalBankAccountsBankApi
  ) {}

  async getCustomers() {
    const observable = this.customersBankApi.listCustomers({});
    return new Promise((resolve) => observable.subscribe(resolve));
  }

  async getCustomer(guid: string) {
    const observable = this.customersBankApi.getCustomer({
      customerGuid: guid,
    });
    return new Promise<CustomerBankModel>((resolve) =>
      observable.subscribe(resolve)
    );
  }

  async createCustomer(
    asset: CybridSupportedCurrency
  ): Promise<NewCybridCustomerType> {
    const newCustomerObservable = this.customersBankApi.createCustomer({
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

        const newAccountObservable = this.accountsBankApi.createAccount({
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

        resolve({
          cybrid_account_guid: account.guid as string,
          cybrid_customer_guid: customer.guid as string,
        });
      });
    });
  }

  async getIdentityVerification(guid: string) {
    const getIdentityVerificationObservable =
      this.identityVerificationsApi.getIdentityVerification({
        identityVerificationGuid: guid,
      });
    return new Promise<IdentityVerificationWithDetailsBankModel>((resolve) =>
      getIdentityVerificationObservable.subscribe(resolve)
    );
  }

  async createIdentityVerification(customerGuid: string) {
    const newIndentityVerficationObservable =
      this.identityVerificationsApi.createIdentityVerification({
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
      identityVerfication.guid,
      {
        backoff: { type: 'exponential', delay: 5000 },
      }
    );
    return identityVerfication;
  }

  async getAccounts(customerGuid: string) {
    const accountObservable = this.accountsBankApi.listAccounts({
      customerGuid,
      type: PostAccountBankModelTypeEnum.Fiat,
    });

    return new Promise<AccountListBankModel>((resolve) =>
      accountObservable.subscribe(resolve)
    );
  }

  async createWorkflow(customerGuid: string) {
    const workflowObservable = this.workflowsBankApi.createWorkflow({
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

  async getWorkflow(workflowGuid: string) {
    const workflowObservable = this.workflowsBankApi.getWorkflow({
      workflowGuid,
    });
    return new Promise<WorkflowBankModel>((resolve) =>
      workflowObservable.subscribe(resolve)
    );
  }

  async createExternalBankAccount(
    customerGuid: string,
    plaidAccountId: string,
    plaidPublicToken: string,
    asset: CybridSupportedCurrency
  ) {
    const externalBankAccountObservable =
      this.externalBankAccountsApi.createExternalBankAccount({
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
        const identityVerificationObservable =
          this.identityVerificationsApi.createIdentityVerification({
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
            identityVerfication,
            { backoff: { type: 'exponential', delay: 3000 } }
          );
        });
        resolve(externalAccount);
      });
    });
  }

  async getExternalBankAccount(externalBankAccountGuid: string) {
    const externalBankAccountObservable =
      this.externalBankAccountsApi.getExternalBankAccount({
        externalBankAccountGuid,
      });
    return new Promise<ExternalBankAccountBankModel>((resolve) =>
      externalBankAccountObservable.subscribe(resolve)
    );
  }

  async getExternalBankAccounts(customerGuid: string) {
    const externalBankAccountObservable =
      this.externalBankAccountsApi.listExternalBankAccounts({
        customerGuid,
      });
    return new Promise<ExternalBankAccountListBankModel>((resolve) =>
      externalBankAccountObservable.subscribe(resolve)
    );
  }
}
