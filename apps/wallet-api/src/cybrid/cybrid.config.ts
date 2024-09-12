import { Configuration } from '@cybrid/cybrid-api-bank-typescript';
import { HttpService } from '@nestjs/axios';
import { CybridConfigParams } from '../types/cybrid';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

export class CybridConfig {
  private static readonly httpService: HttpService = new HttpService();

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

    const {
      data: { access_token: accessToken },
    } = await this.httpService.axiosRef
      .post(
        process.env.CYBRID_TOKEN_ENDPOINT ||
          `https://id.sandbox.cybrid.app/oauth/token`,
        {
          scope,
          grant_type: 'client_credentials',
        },
        {
          headers: {
            Authorization: `${this.generateBasicAuthToken(username, password)}`,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        throw new HttpException(
          'Could not obtain cybrid access token',
          HttpStatus.INTERNAL_SERVER_ERROR,
          { cause: error }
        );
      });

    return new Configuration({
      ...configParams,
      accessToken: `Bearer ${accessToken}`,
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
