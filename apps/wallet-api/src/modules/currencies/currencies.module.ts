import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.RATE_API_HOST,
      params: { api_key: process.env.RATE_API_KEY },
    }),
  ],
  providers: [CurrenciesService],
  controllers: [CurrenciesController],
})
export class CurrenciesModule {}
