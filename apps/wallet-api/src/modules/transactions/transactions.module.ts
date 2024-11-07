import { Module } from '@nestjs/common';
import { CybridDynamicModule } from '../../cybrid/cybrid.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';

@Module({
  imports: [TwoFAModule, CybridDynamicModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
