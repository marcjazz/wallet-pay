import {
  AccountBankModel,
  AccountsBankApi,
  CustomersBankApi,
  IdentityVerificationBankModel,
  IdentityVerificationsBankApi,
  PostAccountBankModelTypeEnum,
  PostCustomerBankModelTypeEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import { Injectable } from '@nestjs/common';
import { CybridSupportedCurrency } from '@prisma/client';
import { NewCybridCustomerType } from '../types/cybrid';

@Injectable({})
export class CybridService {
  constructor(
    private readonly customersBankApi: CustomersBankApi,
    private readonly accountsBankApi: AccountsBankApi,
    private readonly identityVerificationsApi: IdentityVerificationsBankApi // private readonly externalBankAccountsApi: ExternalBankAccountsBankApi,
  ) {}

  async getCustomers() {
    const observable = this.customersBankApi.listCustomers({});
    return new Promise((resolve) => observable.subscribe(resolve));
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
