import {
  AccountsBankApi,
  ConfigurationParameters,
  CustomersBankApi,
  ExternalBankAccountsBankApi,
  IdentityVerificationsBankApi,
  WorkflowsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { cybridConstants } from './constants';
import { CybridConfig } from './cybrid.config';
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

    const configuration = await CybridConfig.getInstance({
      scope: cybridConstants.SCOPE,
      ...configParams,
    });

    return {
      module: CybridModule,
      providers: [
        CybridService,
        {
          provide: CustomersBankApi,
          useValue: new CustomersBankApi(configuration),
        },
        {
          provide: AccountsBankApi,
          useValue: new AccountsBankApi(configuration),
        },
        {
          provide: IdentityVerificationsBankApi,
          useValue: new IdentityVerificationsBankApi(configuration),
        },
        {
          provide: ExternalBankAccountsBankApi,
          useValue: new ExternalBankAccountsBankApi(configuration),
        },
        {
          provide: WorkflowsBankApi,
          useValue: new WorkflowsBankApi(configuration),
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
