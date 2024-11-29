import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchQueryDto } from '../../app/app.dto';
import { RecieversService as ReceiversService } from './receivers.service';
import { ReceiverEntity, ReceiverPayoutInfoDto } from './receiver.dto';
import { Request } from 'express';

@ApiBearerAuth()
@ApiTags('Receivers')
@Controller('receivers')
export class ReceiversController {
  constructor(private readonly receiversService: ReceiversService) {}

  @Get()
  @ApiResponse({ status: 200, type: [ReceiverEntity] })
  @ApiOperation({ summary: 'Fetch all receivers' })
  async findCounterparties(@Query() query: SearchQueryDto) {
    const counterparties = await this.receiversService.findAll(query);
    return counterparties.map(
      (counterparty) => new ReceiverEntity(counterparty)
    );
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: ReceiverEntity })
  @ApiOperation({ summary: 'Fetch one receiver' })
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

  @Post()
  @ApiCreatedResponse({ type: ReceiverEntity })
  @ApiOperation({ summary: 'Create new receiver' })
  async createNewReceiver(
    @Req() request: Request,
    @Body() newReciever: ReceiverPayoutInfoDto
  ) {
    const receiver = await this.receiversService.create(
      newReciever,
      request.user?.person_id as string
    );

    return new ReceiverEntity(receiver);
  }
}
