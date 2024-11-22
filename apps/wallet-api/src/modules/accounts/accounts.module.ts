import { Module } from '@nestjs/common';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { CybridModule } from '../../cybrid/cybrid.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [TwoFAModule, CybridModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
