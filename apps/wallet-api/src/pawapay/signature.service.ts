import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { createHash, createPublicKey, createVerify, KeyObject } from 'crypto';
import {
  createSigner,
  httpbis,
  Request,
  Response,
} from 'http-message-signatures';
import { v4 as uuidv4 } from 'uuid';
import { PawapaySigningOptions } from '../types/pawapay';

export type CustomResponse = Response & {
  body?: unknown;
};

export type CustomRequest = Request & {
  body: string;
  authToken: string;
};

@Injectable()
export class SignatureService {
  constructor(private readonly httpService: HttpService) {}

  async signRequest(
    request: CustomRequest,
    { alg = 'ecdsa-p256-sha256', secretKey, id: keyId }: PawapaySigningOptions
  ): Promise<AxiosRequestConfig> {
    const signingKey = createSigner(secretKey, alg, keyId);

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
        url: request.url as string,
        method: request.method,
        headers: {
          'Signature-Date': new Date().toISOString(),
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Digest': `sha-512=:${this.sha512Digest(request.body)}:`,
          'Content-Length': request.body.length.toString(),
          Authorization: `Bearer ${request.authToken}`,
          'Accept-Signature': 'ecdsa-p256-sha256',
          'Accept-Digest': 'sha-512',
        },
        data: request.body,
      }
    );

    return signedRequest;
  }

  async verifyRequest(request: Request): Promise<boolean> {
    return !!(await httpbis.verifyMessage(
      {
        keyLookup: async (params) => {
          const publicKey = await this.getPublicKey(params.keyid);
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
      request
    ));
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

  private async getPublicKey(keyId?: string): Promise<KeyObject> {
    type Pubkey = {
      id: string;
      key: string;
    };

    const { data: keys } = await this.httpService.axiosRef.get<Pubkey[]>(
      `/public-key/http`
    );
    const pubkey = keyId
      ? keys.find((element: Pubkey) => element.id === keyId)
      : keys[0];

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
