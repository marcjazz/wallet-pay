import {
  AccountsBankApi,
  BaseAPI,
  Configuration,
  CustomersBankApi,
  ExternalBankAccountsBankApi,
  IdentityVerificationsBankApi,
  QuotesBankApi,
  TransfersBankApi,
  WorkflowsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ApiScopeType, CybridAuthResponse } from '../types/cybrid';

export class CybridConfiguration {
  private readonly logger = new Logger(CybridConfiguration.name);
  private readonly CUSTOMER_BANK_LEVEL_TOKEN = 'customer_bank_level_token';

  constructor(
    private readonly httpService: HttpService,
    private readonly configuration: Configuration,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getInstance<T extends typeof BaseAPI>(
    modelName: T,
    customerGuid: string,
    scopes: ApiScopeType[]
  ) {
    const BankApiModelsMap = {
      [CustomersBankApi.name]: CustomersBankApi,
      [AccountsBankApi.name]: AccountsBankApi,
      [ExternalBankAccountsBankApi.name]: ExternalBankAccountsBankApi,
      [IdentityVerificationsBankApi.name]: IdentityVerificationsBankApi,
      [WorkflowsBankApi.name]: WorkflowsBankApi,
      [TransfersBankApi.name]: TransfersBankApi,
      [QuotesBankApi.name]: QuotesBankApi,
    };
    const ModelBankApi = BankApiModelsMap[modelName.name];
    if (!ModelBankApi) {
      throw new NotImplementedException(`${modelName} not supported yet!`);
    }

    const token = await this.getBearerToken(customerGuid, scopes);

    return new ModelBankApi(
      new Configuration({
        ...this.configuration,
        accessToken: `Bearer ${token}`,
      })
    ) as InstanceType<T>;
  }

  async getCustomersApi(customerGuid?: string, scopes?: ApiScopeType[]) {
    const authResp = await this.getBankLevelAccessToken();
    if (customerGuid) {
      authResp.access_token = await this.getBearerToken(
        customerGuid,
        scopes ?? ['customers:read']
      );
    }

    return new CustomersBankApi(
      new Configuration({
        ...this.configuration,
        accessToken: `Bearer ${authResp.access_token}`,
      })
    );
  }

  async getBearerToken(
    customerGuid: string,
    scopes: ApiScopeType[]
  ): Promise<string> {
    const authResp = await this.getBankLevelAccessToken();

    // Get stored value if available
    // let customerTokens: Record<
    //   string,
    //   Array<CybridAuthResponse>
    // > = await this.cacheManager.get(this.CUSTOMER_TOKENs);

    //checks if we have a cached token for this customer with the required scopes
    // const customerCachedToken = (customerTokens[customerGuid] ?? []).find(
    //   (auth) =>
    //     scopes.every((scope) => auth.scope.includes(scope)) &&
    //     new Date(auth.created_at).getTime() + auth.expires_in > Date.now()
    // );
    // if (customerCachedToken) {
    //   return customerCachedToken;
    // }

    const resp = await this.httpService.axiosRef
      .post<{ access_token: string }>(
        process.env.CYBRID_TOKEN_ENDPOINT ||
          `https://id.sandbox.cybrid.app/api/customer_tokens`,
        {
          scopes,
          customer_guid: customerGuid,
        },
        {
          headers: {
            Authorization: `Bearer ${authResp.access_token}`,
          },
        }
      )
      .catch((error) => {
        throw new HttpException(
          'Could not obtain cybrid access token',
          HttpStatus.INTERNAL_SERVER_ERROR,
          { cause: error }
        );
      });
    // const customerTokenResp: CybridAuthResponse = {
    //   access_token: resp.data.access_token,
    //   s
    // }

    return resp.data.access_token;
  }

  private async getBankLevelAccessToken() {
    const { username: clientId, password: clientSecret } = this.configuration;
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Cybrid client ID and client secret must be provided'
      );
    }

    // Get stored value if available
    let authResp = await this.cacheManager.get<CybridAuthResponse>(
      this.CUSTOMER_BANK_LEVEL_TOKEN
    );

    if (
      !authResp ||
      new Date(authResp.created_at).getTime() + authResp.expires_in <=
        Date.now()
    ) {
      const resp = await this.httpService.axiosRef
        .post<CybridAuthResponse>(
          process.env.CYBRID_TOKEN_ENDPOINT ||
            `https://id.sandbox.cybrid.app/oauth/token`,
          {
            grant_type: 'client_credentials',
            scope: 'customers:write customers:execute customers:read',
          },
          {
            headers: {
              Authorization: `${this.generateBasicAuthToken(
                clientId,
                clientSecret
              )}`,
            },
          }
        )
        .catch((error) => {
          throw new HttpException(
            'Could not obtain cybrid access token',
            HttpStatus.INTERNAL_SERVER_ERROR,
            { cause: error }
          );
        });

      authResp = resp.data;
      this.cacheManager.set(this.CUSTOMER_BANK_LEVEL_TOKEN, authResp);
      this.logger.debug(
        'Cybrid access token was successfully retrieve and cached'
      );
    } else {
      this.logger.log('Loaded cybrid bearer token from cache!');
    }

    return authResp;
  }

  private generateBasicAuthToken(username: string, password: string): string {
    // Concatenate the username and password with a colon in between
    const credentials = `${username}:${password}`;

    // Encode the credentials in base64
    const base64Credentials = Buffer.from(credentials).toString('base64');

    // Return the full Basic Auth token
    return `Basic ${base64Credentials}`;
  }
}
