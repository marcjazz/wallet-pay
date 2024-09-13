import { Configuration } from '@cybrid/cybrid-api-bank-typescript';
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { CybridAuthResponse, CybridConfigParams } from '../types/cybrid';

export class CybridConfig {
  private static readonly logger = new Logger(CybridConfig.name);
  private static readonly httpService: HttpService = new HttpService();
  private static readonly als = new AsyncLocalStorage<CybridAuthResponse>();

  static async getInstance({
    scope,
    username,
    password,
    ...configParams
  }: CybridConfigParams) {
    if (!username || !password) {
      throw new InternalServerErrorException(
        'Cybrid username and password must be provided'
      );
    }

    // Get stored value if available
    let authResp = this.als.getStore();

    if (!authResp) {
      const resp = await this.httpService.axiosRef
        .post<CybridAuthResponse>(
          process.env.CYBRID_TOKEN_ENDPOINT ||
            `https://id.sandbox.cybrid.app/oauth/token`,
          {
            scope,
            grant_type: 'client_credentials',
          },
          {
            headers: {
              Authorization: `${this.generateBasicAuthToken(
                username,
                password
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
      this.als.run(authResp, () =>
        this.logger.debug(
          'Cybrid access token was successfully retrieve and cached'
        )
      );
    }

    return new Configuration({
      ...configParams,
      accessToken: `Bearer ${authResp?.access_token}`,
    });
  }

  private static generateBasicAuthToken(
    username: string,
    password: string
  ): string {
    // Concatenate the username and password with a colon in between
    const credentials = `${username}:${password}`;

    // Encode the credentials in base64
    const base64Credentials = Buffer.from(credentials).toString('base64');

    // Return the full Basic Auth token
    return `Basic ${base64Credentials}`;
  }
}
