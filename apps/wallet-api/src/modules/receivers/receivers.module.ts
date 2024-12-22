import { Module } from '@nestjs/common';
import { ReceiversController } from './receivers.controller';
import { RecieversService } from './receivers.service';
import { CybridModule } from '../../cybrid/cybrid.module';
import { MoMoModule } from '../../momo/momo.module';

@Module({
  imports: [CybridModule, MoMoModule],
  controllers: [ReceiversController],
  providers: [RecieversService],
  exports: [RecieversService],
})
export class ReceiversModule {}
