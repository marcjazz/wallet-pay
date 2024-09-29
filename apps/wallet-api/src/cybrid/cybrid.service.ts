import {
  AccountBankModel,
  AccountListBankModel,
  AccountsBankApi,
  CustomerBankModel,
  CustomersBankApi,
  IdentityVerificationBankModel,
  IdentityVerificationsBankApi,
  IdentityVerificationWithDetailsBankModel,
  PostAccountBankModelTypeEnum,
  PostCustomerBankModelTypeEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
  PostWorkflowBankModelKindEnum,
  PostWorkflowBankModelTypeEnum,
  WorkflowBankModel,
  WorkflowsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { NewCybridCustomerType } from '../types/cybrid';

@Injectable({})
export class CybridService {
  constructor(
    private readonly customersBankApi: CustomersBankApi,
    private readonly accountsBankApi: AccountsBankApi,
    private readonly identityVerificationsApi: IdentityVerificationsBankApi,
    private readonly workflowsBankApi: WorkflowsBankApi // private readonly externalBankAccountsApi: ExternalBankAccountsBankApi
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
}
