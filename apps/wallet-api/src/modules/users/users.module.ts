import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AccountsModule } from '../accounts/accounts.module';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';

@Module({
  imports: [TwoFAModule, AccountsModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
