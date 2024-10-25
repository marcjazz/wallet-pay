import {
  Configuration,
  ConfigurationParameters,
} from '@cybrid/cybrid-api-bank-typescript';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { cybridConstants } from './constants';
import { CybridConfiguration } from './cybrid.config';
import { CybridService } from './cybrid.service';

@Module({})
export class CybridModule {
  private static readonly logger = new Logger(CybridModule.name);

  static async forRoot(
    configParams: ConfigurationParameters
  ): Promise<DynamicModule> {
    // providing ajax feature on server for cybrid dependency
    global.XMLHttpRequest = require('xhr2');
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Optionally perform cleanup and exit
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Optionally perform cleanup and exit
    });

    return {
      module: CybridModule,
      imports: [
        HttpModule.register({}),
        CacheModule.registerAsync({
          useFactory: async () => {
            const store = await redisStore({
              socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
              },
            });

            return {
              store: store as unknown as CacheStore,
              ttl: 3 * 60000, // 3 minutes (milliseconds)
            };
          },
        }),
        BullModule.registerQueue({
          name: cybridConstants.QUEUE,
        }),
      ],
      providers: [
        CybridService,
        CybridConfiguration,
        {
          provide: Configuration,
          useValue: new Configuration(configParams),
        },
      ],
      exports: [CybridService],
    };
  }
}

export const CybridDynamicModule = CybridModule.forRoot({
  username: process.env.CYBRID_CLIENT_ID,
  password: process.env.CYBRID_CLIENT_SECRET,
});
