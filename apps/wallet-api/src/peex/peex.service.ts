import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * @generator
 * npx @openapitools/openapi-generator-cli generate \
  -i peex-openapi.yaml \
  -g typescript-axios \
  -o apps/wallet-api/src/peex/peex-client \
  --additional-properties=useSingleRequestParameter=true
 */
import { DefaultService, OpenAPI } from './peex-client';

@Injectable()
export class PeexService {
  constructor(configService: ConfigService) {
    OpenAPI.BASE = configService.get(
      'PEEX_API_BASE_URL',
      'https://sandbox.peexit.com/api/v1'
    );
    OpenAPI.HEADERS = {
      SECRETKEY: configService.get('PEEX_SECRETKEY', ''),
    };

    console.log(OpenAPI)
  }

  async getPartnerInfo() {
    console.log(OpenAPI)
    return await DefaultService.getPartnerInfo();
  }

  async verifyPhone(mobile_phone: string) {
    return await DefaultService.verifyPhoneNumber({
      mobile_phone,
    });
  }

  async requestPayment(data: {
    amount: number;
    track_id: string;
    mobile_phone: string;
  }) {
    return await DefaultService.requestMobilePayment({
      aml_cft: true,
      first_name: '',
      last_name: '',
      from_currency: 'XAF',
      to_currency: 'XAF',
      to_country: 'CM',
      fxrate: 1,
      fund_origin: '',
      purpose: '',
      sender_country: '',
      sender_first_name: '',
      sender_last_name: '',
      sender_mobile_phone: '',
      ...data,
    });
  }

  async getRequestPayment(trackId: string) {
    const [track] = await DefaultService.getAllPaymentRequests(trackId);

    return track;
  }
}
