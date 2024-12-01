import {
  AccountsBankApi,
  BaseAPI,
  Configuration,
  CounterpartiesBankApi,
  CustomersBankApi,
  ExternalBankAccountsBankApi,
  IdentityVerificationsBankApi,
  QuotesBankApi,
  TradesBankApi,
  TransfersBankApi,
  WorkflowsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { ApiScopeType, CybridAuthResponse } from '../types/cybrid';

@Injectable()
export class CybridConfig {
  private readonly logger = new Logger(CybridConfig.name);
  private readonly CUSTOMER_BANK_LEVEL_TOKEN = 'customer_bank_level_token';

  constructor(
    private readonly httpService: HttpService,
    private readonly configuration: Configuration,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService
  ) {}

  async getInstance<T extends typeof BaseAPI>(
    modelName: T,
    scopes: ApiScopeType[],
    customerGuid?: string
  ) {
    const BankApiModelsMap = {
      [CustomersBankApi.name]: CustomersBankApi,
      [AccountsBankApi.name]: AccountsBankApi,
      [ExternalBankAccountsBankApi.name]: ExternalBankAccountsBankApi,
      [IdentityVerificationsBankApi.name]: IdentityVerificationsBankApi,
      [WorkflowsBankApi.name]: WorkflowsBankApi,
      [TransfersBankApi.name]: TransfersBankApi,
      [QuotesBankApi.name]: QuotesBankApi,
      [CounterpartiesBankApi.name]: CounterpartiesBankApi,
      [TradesBankApi.name]: TradesBankApi,
    };
    const ModelBankApi = BankApiModelsMap[modelName.name];
    if (!ModelBankApi) {
      throw new NotImplementedException(`${modelName} not supported yet!`);
    }

    const bankLevelAllowedScopes: ApiScopeType[] = [
      // useful for creating a new customer
      'customers:execute',
      // useful for requesting customer level token
      'customers:read',
      'customers:write',
      // use for executing our batch crypto transfer
      'transfers:execute',
      'transfers:read',
    ];

    let token: string;
    if (customerGuid) {
      token = await this.getBearerToken(customerGuid, scopes);
    } else if (
      scopes.every((scope) => bankLevelAllowedScopes.includes(scope))
    ) {
      const authResp = await this.getBankLevelAccessToken(scopes);
      token = authResp.access_token;
    } else
      throw new HttpException(
        `Scopes different from ${bankLevelAllowedScopes} are not acceptable for unknwon customers`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: new Error(
            `Bad usage of ${CybridConfig.prototype.getInstance} method`
          ),
        }
      );

    return new ModelBankApi(
      new Configuration({
        ...this.configuration,
        accessToken: `Bearer ${token}`,
      })
    ) as InstanceType<T>;
  }

  private async getBearerToken(
    customerGuid: string,
    scopes: ApiScopeType[]
  ): Promise<string> {
    const authResp = await this.getBankLevelAccessToken();

    const resp = await this.httpService.axiosRef
      .post<{ access_token: string }>(
        this.configService.get(
          'CYBRID_CUSTOMER_LEVEL_TOKEN_ENDPOINT',
          'https://id.sandbox.cybrid.app/api/customer_tokens'
        ),
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

    this.logger.log(`Successfully fetch customer level token: ${resp.data}`);
    return resp.data.access_token;
  }

  private async getBankLevelAccessToken(
    // Defualt to the required scopes for requesting customer level access token
    scopes: ApiScopeType[] = ['customers:write', 'customers:read']
  ) {
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
      !scopes.every((scope) => authResp?.scope.includes(scope)) ||
      new Date(authResp.created_at * 1000).getTime() +
        authResp.expires_in * 1000 <=
        Date.now()
    ) {
      const resp = await this.httpService.axiosRef
        .post<CybridAuthResponse>(
          this.configService.get(
            'CYBRID_BANK_LEVEL_TOKEN_ENDPOINT',
            `https://id.sandbox.cybrid.app/oauth/token`
          ),
          {
            grant_type: 'client_credentials',
            scope: scopes.join(' '),
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
      this.logger.debug('Loaded cybrid bearer token from cache!');
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
