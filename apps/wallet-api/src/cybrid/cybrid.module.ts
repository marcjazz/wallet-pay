import {
  Configuration,
  ConfigurationParameters,
} from '@cybrid/cybrid-api-bank-typescript';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { cybridConstants } from './constants';
import { CybridService } from './cybrid.service';
import { CybridConfiguration } from './cybrid.config';
import { HttpModule } from '@nestjs/axios';

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
        CacheModule.register(),
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
