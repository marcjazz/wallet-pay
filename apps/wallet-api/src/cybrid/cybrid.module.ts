import {
  AccountsBankApi,
  BaseAPI,
  ConfigurationParameters,
  CustomersBankApi,
  ExternalBankAccountsBankApi,
  IdentityVerificationsBankApi,
} from '@cybrid/cybrid-api-bank-typescript';
import { DynamicModule, Module } from '@nestjs/common';
import { CybridConfig } from './cybrid.config';
import { CybridService } from './cybrid.service';
import { BullModule } from '@nestjs/bull';
import { cybridConstants } from './constants';
import { CybridProcessor } from './cybrid.processor';

@Module({})
export class CybridModule {
  static forRoot(configParams: ConfigurationParameters): DynamicModule {
    const getBaseApiInstance = async (Model: typeof BaseAPI, scope: string) => {
      const configuration = await CybridConfig.getInstance({
        scope,
        ...configParams,
      });
      return new Model(configuration);
    };

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
          useFactory: () =>
            getBaseApiInstance(
              CustomersBankApi,
              'customers:read customers:write customers:execute'
            ),
        },
        {
          provide: AccountsBankApi,
          useFactory: () =>
            getBaseApiInstance(
              AccountsBankApi,
              'accounts:read accounts:execute'
            ),
        },
        {
          provide: IdentityVerificationsBankApi,
          useFactory: () =>
            getBaseApiInstance(
              IdentityVerificationsBankApi,
              'identity_verifications:read identity_verifications:write identity_verifications:execute'
            ),
        },
        {
          provide: ExternalBankAccountsBankApi,
          useFactory: () =>
            getBaseApiInstance(
              ExternalBankAccountsBankApi,
              'external_bank_accounts:read external_bank_accounts:write external_bank_accounts:execute'
            ),
        },
      ],
      exports: [CybridService],
    };
  }
}
