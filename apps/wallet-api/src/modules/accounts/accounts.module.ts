import { Module } from '@nestjs/common';
import { CybridDynamicModule } from '../../cybrid/cybrid.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [CybridDynamicModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
