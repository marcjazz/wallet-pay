import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validatePhoneNumber } from '../helpers/utils';
import { SignatureService } from './signature.service';
import { PawapayPayoutResponse } from '../types/pawapay';

type InitiatePayoutPayload = {
  amount: number;
  receipientPhonenumber: string;
  customerEmail: string;
  transactionId: string;
  payoutId: string;
};

@Injectable()
export class PawapayService {
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly signatureService: SignatureService
  ) {
    const baseUrl = this.httpService.axiosRef.defaults.baseURL;

    if (!baseUrl) {
      throw new InternalServerErrorException(
        `Base url not provided. Please add PAWAPAY_API_BASE_URL to environmental variables`
      );
    }

    this.baseUrl = baseUrl;
  }

  async initiatePayout({
    amount,
    customerEmail,
    receipientPhonenumber,
    transactionId,
    payoutId
  }: InitiatePayoutPayload) {
    const result = validatePhoneNumber(receipientPhonenumber);
    if (result === -1) {
      throw new UnprocessableEntityException(`Invalid reciepient phone number`);
    }

    const correspondents = {
      0: 'MTN_MOMO_CMR',
      1: 'ORANGE_CMR',
    };

    const requestBody = JSON.stringify({
      amount,
      payoutId,
      currency: 'XAF',
      correspondent: correspondents[result],
      recipient: {
        type: 'MSISDN',
        address: {
          value: receipientPhonenumber,
        },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `XafPay Remittance`,
      country: 'CMR',
      metadata: [
        {
          fieldName: 'customerEmail',
          fieldValue: customerEmail,
          isPII: true,
        },
        {
          fieldName: 'transactionId',
          fieldValue: transactionId,
        },
      ],
    });

    const endpoint = `${this.baseUrl}/payouts`;
    const signRequest = await this.signatureService.signRequest(
      'POST',
      endpoint,
      requestBody
    );
    const payoutResp = await this.httpService.axiosRef.request<PawapayPayoutResponse>(
      signRequest
    );

    return payoutResp.data;
  }
}
