import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { cybridConstants } from '../constants';
import { CybridSubscriptionsController } from './cybrid-subscriptions.controller';
import { IdentityVerificationProcessor } from './processors/identity-verification.processor';
import { TransactionProcessor } from './processors/transaction.processor';
import { CybridModule } from '../cybrid.module';

@Module({
  imports: [
    CybridModule,
    BullModule.registerQueue({
      name: cybridConstants.WEBHOOK_QUEUE,
    }),
  ],
  controllers: [CybridSubscriptionsController],
  providers: [IdentityVerificationProcessor, TransactionProcessor],
})
export class CybridSubscriptionsModule {}
