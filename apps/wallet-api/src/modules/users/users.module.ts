import { Module } from '@nestjs/common';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TwoFAModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
