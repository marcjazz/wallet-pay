import { Module } from '@nestjs/common';
import { CybridModule } from '../../cybrid/cybrid.module';
import { ReceiversController } from './receivers.controller';
import { RecieversService } from './receivers.service';
import { PeexService } from '@xafpay/api/peex/peex.service';

@Module({
  imports: [CybridModule],
  controllers: [ReceiversController],
  providers: [RecieversService, PeexService],
  exports: [RecieversService],
})
export class ReceiversModule {}
