import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { constants } from '../../constants';
import { CybridModule } from '../../cybrid/cybrid.module';
import { PawapayModule } from '../../pawapay/pawapay.module';
import { IdentityVerificationProcessor } from './processors/identity-verification.processor';
import { TransactionProcessor } from './processors/transaction.processor';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    CybridModule,
    PawapayModule,
    BullModule.registerQueue({
      name: constants.WEBHOOK_QUEUE,
    }),
  ],
  controllers: [WebhooksController],
  providers: [IdentityVerificationProcessor, TransactionProcessor],
})
export class WebhooksModule {}
