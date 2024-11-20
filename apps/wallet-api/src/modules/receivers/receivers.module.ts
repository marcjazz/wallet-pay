import { Module } from '@nestjs/common';
import { ReceiversController } from './receivers.controller';
import { RecieversService } from './receivers.service';

@Module({
  controllers: [ReceiversController],
  providers: [RecieversService],
  exports: [RecieversService],
})
export class ReceiversModule {}
