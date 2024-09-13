import {
  AccountsBankApi,
  ConfigurationParameters,
  CustomersBankApi,
  ExternalBankAccountsBankApi,
  IdentityVerificationsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { BullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { cybridConstants } from './constants';
import { CybridConfig } from './cybrid.config';
import { CybridProcessor } from './cybrid.processor';
import { CybridService } from './cybrid.service';

@Module({})
export class CybridModule {
  static async forRoot(
    configParams: ConfigurationParameters
  ): Promise<DynamicModule> {
    const configuration = await CybridConfig.getInstance({
      scope: cybridConstants.SCOPE,
      ...configParams,
    });

    return {
      module: CybridModule,
      imports: [
        BullModule.registerQueue({
          name: cybridConstants.QUEUE,
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        }),
      ],
      providers: [
        CybridService,
        CybridProcessor,
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
      ],
      exports: [CybridService],
    };
  }
}

export const CybridDynamicModule = CybridModule.forRoot({
  username: process.env.CYBRID_CLIENT_ID,
  password: process.env.CYBRID_CLIENT_SECRET,
});
