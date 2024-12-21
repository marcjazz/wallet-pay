import { Module } from '@nestjs/common';
import { MomoService } from './momo.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const baseUrl = configService.get<string>('MOMO_API_BASE_URL');
        const apiUser = configService.get<string>('MOMO_REMITTANCE_API_USER');
        const apiKey = configService.get<string>('MOMO_REMITTANCE_API_KEY');
        const subscriptionKey = configService.get<string>(
          'REMITTANCE_SUBCRIPTION_KEY'
        );
        if (!apiUser || !apiKey) {
          throw new Error(`Missing MoMo API credentials`);
        }

        return {
          baseURL: baseUrl,
          auth: {
            username: apiUser,
            password: apiKey,
          },
          headers: {
            'X-Target-Environment':
              nodeEnv === 'production' ? 'production' : 'sandbox',
            'Ocp-Apim-Subscription-Key': subscriptionKey,
          },
        };
      },
    }),
  ],
  providers: [MomoService],
  exports: [MomoService],
})
export class MoMoModule {}
