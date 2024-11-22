import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          baseURL: configService.get('RATE_API_HOST'),
          params: { api_key: configService.get('RATE_API_KEY') },
        };
      },
    }),
  ],
  providers: [CurrenciesService],
  controllers: [CurrenciesController],
})
export class CurrenciesModule {}
