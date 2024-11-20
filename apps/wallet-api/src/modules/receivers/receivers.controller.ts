import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchQueryDto } from '../../app/app.dto';
import { RecieversService as ReceiversService } from './receivers.service';
import { ReceiverEntity } from './receiver.dto';

@ApiBearerAuth()
@ApiTags('Receivers')
@Controller('receivers')
export class ReceiversController {
  constructor(private readonly receiversService: ReceiversService) {}

  @Get()
  @ApiResponse({ status: 200, type: [ReceiverEntity] })
  @ApiOperation({ summary: 'Fetch all counterparties' })
  async findCounterparties(@Query() query: SearchQueryDto) {
    const counterparties = await this.receiversService.findAll(query);
    return counterparties.map(
      (counterparty) => new ReceiverEntity(counterparty)
    );
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: ReceiverEntity })
  @ApiOperation({ summary: 'Fetch one counterparty' })
  async findCounterparty(@Param('id') cybridCounterpartyId: string) {
    const counterparty = await this.receiversService.findOne(
      cybridCounterpartyId
    );

    if (!counterparty) {
      throw new NotFoundException(
        `Counterparty with ID ${cybridCounterpartyId} not found!`
      );
    }

    return new ReceiverEntity(counterparty);
  }
}
