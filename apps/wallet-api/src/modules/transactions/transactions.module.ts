import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { CybridModule } from '../../cybrid/cybrid.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [ScheduleModule.forRoot(), TwoFAModule, CybridModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
