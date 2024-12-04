import { Module } from '@nestjs/common';
import { CybridModule } from '../../cybrid/cybrid.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PawapayModule } from '../../pawapay/pawapay.module';

@Module({
  imports: [ScheduleModule.forRoot(), TwoFAModule, CybridModule, PawapayModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
