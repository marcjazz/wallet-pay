import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  AccountHolderBasicInfo,
  InitiatePayoutPayload,
  MoMoAccessToken,
  RemittanceEntity,
} from '../types/momo';

@Injectable()
export class MomoService {
  private readonly REMITTANCE_ACCESS_TOKEN_CACHE_KEY =
    'remittance_access-token_cache_key';
  private readonly logger = new Logger(MomoService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.httpService.axiosRef.interceptors.request.use(async (config) => {
      if (config.url?.includes('/token')) {
        const accessToken = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    });
  }

  private async getAccessToken() {
    // Get stored value if available
    let authResp = await this.cacheManager.get<MoMoAccessToken>(
      this.REMITTANCE_ACCESS_TOKEN_CACHE_KEY
    );

    if (
      !authResp ||
      Number(authResp.created_at) + Number(authResp.expires_in) * 1000 <
        Date.now()
    ) {
      const { data } = await this.httpService.axiosRef.post<MoMoAccessToken>(
        `/remittance/token/`,
        null
      );
      authResp = {
        created_at: Date.now(),
        token_type: data.token_type,
        access_token: data.access_token,
        expires_in: data.expires_in * 1000,
      };
      await this.cacheManager.set(
        this.REMITTANCE_ACCESS_TOKEN_CACHE_KEY,
        authResp
      );
      this.logger.debug(
        'MoMo access token was successfully retrieved and cached'
      );
    } else {
      this.logger.debug('Loaded MoMo bearer token from cache!');
    }

    return authResp as MoMoAccessToken;
  }

  /**
   * Cash transfer operation is used to transfer an amount from the owner’s account to a payee account.
   * Status of the transaction can be validated by using GET /cashtransfer/{referenceId}
   * @param phoneNumber
   * @param amount
   * @param payeeNote
   * @returns
   */
  async initiateCashTransfer({
    amount,
    receipientPhonenumber,
    customerEmail,
    transactionId,
    callbackUrl,
  }: InitiatePayoutPayload) {
    await this.httpService.axiosRef.post(
      // '/remittance/v2_0/cashtransfer',
      '/remittance/v1_0/transfer',
      {
        amount,
        currency: process.env.NODE_ENV === 'production' ? 'XAF' : 'EUR',
        externalId: transactionId,
        payee: {
          partyIdType: 'MSISDN',
          partyId: receipientPhonenumber,
        },
        payeeNote: `Remittance from ${customerEmail}`,
        payerMessage: 'XafPay Remittance',
        // orginatingCountry: 'United States',
        // originalCurrency: 'USD',
        // payerIdentificationType: 'IDCD',
        // payerIdentificationNumber: 'A872349865',
        // payerIdentity: '9238674583',
        // payerFirstName: 'John',
        // payerLanguageCode: 'en',
        // payerEmail: 'john.doe@example.com',
        // payerMsisdn: '+1234567890',
        // payerGender: 'MALE',
      },
      {
        headers: {
          'X-Reference-Id': transactionId,
          'X-Callback-Url': callbackUrl,
        },
      }
    );

    return transactionId;
  }

  async getCashTransfer(referenceId: string) {
    const resp = await this.httpService.axiosRef.get<RemittanceEntity>(
      `/remittance/v2_0/cashtransfer/${referenceId}`
    );
    return resp.data;
  }

  /**
   * This operation returns personal information of the account holder. The operation does not need any consent by the account holder.
   * @param phoneNumber account holder phone number
   * @returns
   */
  async getAccountHolderBasicInfo(phoneNumber: string) {
    const resp = await this.httpService.axiosRef.get<AccountHolderBasicInfo>(
      `/remittance/v1_0/accountholder/msisdn/${phoneNumber}/basicuserinfo`
    );

    return resp.data;
  }

  /**
   * Operation is used to check if an account holder is registered and active in the system.
   * @param phoneNumber account holder phone number
   * @returns
   */
  async validateAccountHolderStatus(phoneNumber: string) {
    const resp = await this.httpService.axiosRef.get<{ result: boolean }>(
      `/remittance/v1_0/accountholder/msisdn/${phoneNumber}/active`
    );

    return resp.data.result;
  }
}
