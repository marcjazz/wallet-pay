import { Configuration } from '@cybrid/cybrid-api-bank-typescript';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CybridConfig } from './cybrid.config';
import { CybridService } from './cybrid.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: Number(configService.get('REDIS_PORT')),
          },
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 3 * 60000, // 3 minutes (milliseconds)
        };
      },
    }),
  ],
  providers: [
    CybridService,
    CybridConfig,
    {
      provide: Configuration,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new Configuration({
          username: configService.get('CYBRID_CLIENT_ID'),
          password: configService.get('CYBRID_CLIENT_SECRET'),
        });
      },
    },
  ],
  exports: [CybridService],
})
export class CybridModule {
  constructor() {
    // providing ajax feature on server for cybrid dependency
    global.XMLHttpRequest = require('xhr2');
  }
}
