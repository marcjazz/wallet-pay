import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { CybridModule } from '../../cybrid/cybrid.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bull';
import { constants } from '../../constants';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TwoFAModule,
    CybridModule,
    BullModule.registerQueue({
      name: constants.WEBHOOK_QUEUE,
    }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
