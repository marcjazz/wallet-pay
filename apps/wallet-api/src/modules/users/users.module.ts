import { Module } from '@nestjs/common';
import { TwoFAModule } from '../../app/two-fa/two-fa.module';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TwoFAModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
