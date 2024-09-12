import {
  AccountBankModel,
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
} from '@cybrid/cybrid-api-bank-typescript';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { Queue } from 'bull';
import { NewCybridCustomerType } from '../types/cybrid';
import { cybridConstants } from './constants';

@Injectable({})
export class CybridService {
  constructor(
    @InjectQueue(cybridConstants.QUEUE)
    private cybridQueue: Queue,
    private readonly customersBankApi: CustomersBankApi,
    private readonly accountsBankApi: AccountsBankApi,
    private readonly identityVerificationsApi: IdentityVerificationsBankApi // private readonly externalBankAccountsApi: ExternalBankAccountsBankApi,
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

        // add a job to queue that would look up until customer is completly create and initiate identity verification
        await this.cybridQueue.add('identity-verification-init', customer.guid);

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
}
