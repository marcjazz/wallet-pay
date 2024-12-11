import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { validatePhoneNumber } from '../helpers/utils';
import {
  PawapayPayoutRequestBody,
  PawapayPayoutResponse,
} from '../types/pawapay';
import { RecipientType } from '../types/pawapay/enum';

type InitiatePayoutPayload = {
  amount: number;
  receipientPhonenumber: string;
  customerEmail: string;
  transactionId: string;
  payoutId: string;
};

@Injectable()
export class PawapayService {
  constructor(private readonly httpService: HttpService) {}

  async initiatePayout({
    amount,
    customerEmail,
    receipientPhonenumber,
    transactionId,
    payoutId,
  }: InitiatePayoutPayload) {
    const result = validatePhoneNumber(receipientPhonenumber);
    if (result === -1) {
      throw new UnprocessableEntityException(`Invalid reciepient phone number`);
    }

    const correspondents = {
      0: 'MTN_MOMO_CMR',
      1: 'ORANGE_CMR',
    };

    const requestBody: PawapayPayoutRequestBody = {
      amount,
      payoutId,
      currency: 'XAF',
      correspondent: correspondents[result],
      recipient: {
        type: RecipientType.MSISDN,
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
    };

    const payoutResp =
      await this.httpService.axiosRef.post<PawapayPayoutResponse>(
        `/payouts`,
        requestBody
      );

    return payoutResp.data;
  }
}
