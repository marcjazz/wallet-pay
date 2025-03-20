import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PawapayService } from './pawapay.service';
import { SignatureService } from './signature.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          baseURL: configService.get('PAWAPAY_API_BASE_URL'),
          headers: {
            Authorization: `Bearer ${configService.get(
              'PAWAPAY_API_BEARER_TOKEN'
            )}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
        };
      },
    }),
  ],
  providers: [PawapayService, SignatureService],
  exports: [PawapayService, SignatureService],
})
export class PawapayModule {}
