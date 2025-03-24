import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { constants } from '../../constants';
import { CybridModule } from '../../cybrid/cybrid.module';
import { IdentityVerificationsProcessor } from './processors/identity-verifications.processor';
import { TransactionsProcessor } from './processors/transactions.processor';
import { WebhooksController } from './webhooks.controller';
import { TradesProcessor } from './processors/trades.processor';

@Module({
  imports: [
    CybridModule,
    BullModule.registerQueue({
      name: constants.WEBHOOK_QUEUE,
    }),
  ],
  controllers: [WebhooksController],
  providers: [
    IdentityVerificationsProcessor,
    TransactionsProcessor,
    TradesProcessor,
  ],
})
export class WebhooksModule {}
