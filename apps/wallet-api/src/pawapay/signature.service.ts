import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, Method } from 'axios';
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  createVerify,
  KeyObject,
} from 'crypto';
import * as fs from 'fs';
import {
  createSigner,
  httpbis,
  Response
} from 'http-message-signatures';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export type CustomResponse = Response & {
  body?: unknown;
};

@Injectable()
export class SignatureService {
  private privateKey: KeyObject;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // load private generated with
    // openssl ecparam -name P-256 -genkey -noout -out private-key.pem
    this.privateKey = createPrivateKey(
      fs.readFileSync(path.join(__dirname, './private-key.pem'), 'utf8')
    );
  }

  async signRequest(
    requestMethod: Method,
    requestUrl: string,
    requestBody: string
  ): Promise<AxiosRequestConfig> {
    const authToken = this.configService.get<string>(
      'PAWAPAY_API_BEARER_TOKEN'
    );
    const keyId = this.configService.get<string>('PRIVATE_KEY_ID');
    if (!keyId) {
      throw new InternalServerErrorException(
        `Key ID not provided. Please add PRIVATE_KEY_ID to environmental variables`
      );
    }
    const signingKey = createSigner(
      this.privateKey,
      'ecdsa-p256-sha256',
      keyId
    );

    const signedRequest = await httpbis.signMessage(
      {
        key: signingKey,
        name: 'sig-pp',
        fields: [
          '@method',
          '@authority',
          '@path',
          'signature-date',
          'content-digest',
          'content-type',
          'content-length',
        ],
      },
      {
        url: requestUrl,
        method: requestMethod,
        headers: {
          'Signature-Date': new Date().toISOString(),
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Digest': `sha-512=:${this.sha512Digest(requestBody)}:`,
          'Content-Length': requestBody.length.toString(),
          Authorization: `Bearer ${authToken}`,
          'Accept-Signature': 'ecdsa-p256-sha256',
          'Accept-Digest': 'sha-512',
        },
        data: requestBody,
      }
    );

    return signedRequest;
  }

  async verifyResponse(response: Response): Promise<boolean> {
    const verified = await httpbis.verifyMessage(
      {
        keyLookup: async (params) => {
          const publicKey = await this.getPublicKey(params.keyid as string);
          return {
            id: params.keyid,
            algs: ['ecdsa-p256-sha256'],
            verify: async (data: Buffer, signature) =>
              createVerify('ecdsa-p256-sha256')
                .update(data)
                .verify(publicKey, signature.toString('utf8'), 'base64'),
          };
        },
      },
      response
    );

    const digestValid = this.verifyDigest(response);

    return !!verified && digestValid;
  }

  private sha512Digest(data: string): string {
    return createHash('sha512').update(data).digest('base64');
  }

  private verifyDigest(message: CustomResponse): boolean {
    const headerDigest = this.extractHeader('content-digest', message).replace(
      /:/g,
      ''
    );
    const calculatedDigest = this.sha512Digest(message.body as string);
    return headerDigest === calculatedDigest;
  }

  private extractHeader(headerName: string, message: Response): string {
    return message.headers[headerName].toString();
  }

  private async getPublicKey(keyId: string): Promise<KeyObject> {
    type Pubkey = {
      id: string;
      key: string;
    };

    const { data: keys } = await this.httpService.axiosRef.get<Pubkey[]>(
      `/public-key/http`
    );
    const pubkey = keys.find((element: Pubkey) => element.id === keyId);

    if (!pubkey) {
      throw new NotFoundException(`No pubkey found for ${keyId}.`);
    }

    return createPublicKey(pubkey.key);
  }

  createSampleRequest(): string {
    return JSON.stringify({
      depositId: uuidv4(),
      amount: '15',
      currency: 'ZMW',
      correspondent: 'MTN_MOMO_ZMB',
      payer: {
        type: 'MSISDN',
        address: {
          value: '260763456789',
        },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: 'Signed deposit',
    });
  }
}
