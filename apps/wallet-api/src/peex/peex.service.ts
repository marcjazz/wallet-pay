import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as DefaultService from './gen';
import {
  Client,
  ClientOptions,
  createClient,
  createConfig,
} from '@hey-api/client-fetch';
import type { PayoutPayload } from '../types/payout';

@Injectable()
export class PeexService {
  private apiClient: Client;
  private readonly logger = new Logger(PeexService.name);

  constructor(configService: ConfigService) {
    this.apiClient = createClient(
      createConfig<ClientOptions>({
        baseUrl: configService.get(
          'PEEX_API_BASE_URL',
          'https://sandbox.peexit.com/api/v1'
        ),
        headers: {
          SECRETKEY: configService.get('PEEX_SECRETKEY', ''),
        },
      })
    );
  }

  async getPartnerInfo() {
    const { data, error } = await DefaultService.getPartnerInfo({
      client: this.apiClient,
    });

    if (error) {
      this.logger.error(error);
      throw new Error('Unable to retrieve partner details');
    }

    return data;
  }

  async verifyPhone(phone_number: string) {
    const { data, error } = await DefaultService.verifyPhoneNumber({
      body: { phone_number },
      client: this.apiClient,
    });

    if (error) {
      this.logger.error(error);
      throw new Error('Unable to verify phone number');
    }

    return data;
  }

  async requestPayment({
    amount,
    receipientPhonenumber,
    trackId,
    senderFirstName,
    senderLastName,
    senderMobilePhone,
  }: PayoutPayload) {
    const { data, error } = await DefaultService.requestMobilePayment({
      body: {
        aml_cft: true,
        first_name: '',
        last_name: '',
        from_currency: 'XAF',
        to_currency: 'XAF',
        to_country: 'CM',
        fxrate: 1,
        fund_origin: '',
        purpose: '',
        sender_country: 'US',
        mobile_phone: receipientPhonenumber,
        sender_first_name: senderFirstName ?? 'XafPay',
        sender_last_name: senderLastName ?? 'llc',
        sender_mobile_phone: senderMobilePhone ?? '+1703899-5276',
        amount,
        track_id: trackId,
      },
      client: this.apiClient,
    });

    if (error) {
      this.logger.error(error);
      throw new Error('Unable to placed payment!');
    }

    return data?.request;
  }

  async getRequestPayment(trackId: string) {
    const { data, error } = await DefaultService.getAllPaymentRequests({
      query: { track_id: trackId },
      client: this.apiClient,
    });

    if (error) {
      this.logger.error(error);
      throw new Error('Unable to retrieve payment details');
    }

    return data ? data[0] : null;
  }
}
