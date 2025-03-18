import { Module } from '@nestjs/common';
import { CybridModule } from '../../cybrid/cybrid.module';
import { ReceiversController } from './receivers.controller';
import { RecieversService } from './receivers.service';

@Module({
  imports: [CybridModule],
  controllers: [ReceiversController],
  providers: [RecieversService],
  exports: [RecieversService],
})
export class ReceiversModule {}
