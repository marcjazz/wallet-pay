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
import { Request } from 'express';
import { SearchQueryDto } from '../../app/app.dto';
import { CreateReceiverDto, ReceiverEntity } from './receiver.dto';
import { RecieversService as ReceiversService } from './receivers.service';
import { SkipAuth } from '@xafpay/api/app/auth/auth.decorator';
import { PeexService } from '@xafpay/api/peex/peex.service';

@ApiBearerAuth()
@ApiTags('Receivers')
@Controller('receivers')
export class ReceiversController {
  constructor(
    private readonly receiversService: ReceiversService,
    private readonly peexService: PeexService
  ) {}

  @SkipAuth()
  @Post('test')
  async getCustomers() {
    return this.peexService.requestPayment({
      amount: 100,
      mobile_phone: '+237673016895',
      track_id: crypto.randomUUID(),
    });
  }

  @Get()
  @ApiResponse({ status: 200, type: [ReceiverEntity] })
  @ApiOperation({ summary: 'Fetch all receivers' })
  async findCounterparties(
    @Query() query: SearchQueryDto,
    @Req() request: Request
  ) {
    const counterparties = await this.receiversService.findAll({
      ...query,
      person_id: request.user?.person_id as string,
    });
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
    @Body() newReciever: CreateReceiverDto
  ) {
    const receiver = await this.receiversService.create(
      newReciever,
      request.user?.person_id as string
    );

    return new ReceiverEntity(receiver);
  }
}
