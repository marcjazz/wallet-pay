import { Module } from '@nestjs/common';
import { CybridModule } from '../../cybrid/cybrid.module';
import { ReceiversController } from './receivers.controller';
import { RecieversService } from './receivers.service';
import { BullModule } from '@nestjs/bull';
import { constants } from '../../constants';

@Module({
  imports: [
    CybridModule,
    BullModule.registerQueue({
      name: constants.WEBHOOK_QUEUE,
    }),
  ],
  controllers: [ReceiversController],
  providers: [RecieversService],
  exports: [RecieversService],
})
export class ReceiversModule {}
