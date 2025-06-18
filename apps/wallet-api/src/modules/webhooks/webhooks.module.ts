import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PeexService } from '../../peex/peex.service';
import { constants } from '../../constants';
import { CybridModule } from '../../cybrid/cybrid.module';
import { IdentityVerificationsProcessor } from './processors/identity-verifications.processor';
import { TradesProcessor } from './processors/trades.processor';
import { TransactionsProcessor } from './processors/transactions.processor';
import { WebhooksController } from './webhooks.controller';
import { PayoutProcessor } from './processors/payout.processor';

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
    PayoutProcessor,
    PeexService,
  ],
})
export class WebhooksModule {}
