import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
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

@ApiBearerAuth()
@ApiTags('Receivers')
@Controller('receivers')
export class ReceiversController {
  constructor(private readonly receiversService: ReceiversService) {}

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
    const { counterpartyVerify, receiverVerified: receiver } =
      await this.receiversService.create(
        newReciever,
        request.user?.person_id as string
      );

    if (counterpartyVerify.outcome === 'failed') {
      throw new UnprocessableEntityException(
        `Failed to verify the new counterParty due to ${counterpartyVerify.failure_codes?.join(
          ', '
        )}`
      );
    }

    if (receiver.verification_status === 'EXPIRED') {
      throw new UnprocessableEntityException(
        'Sorry! Verification got too much time and expired. Please try again.'
      );
    }
    if (receiver.verification_status !== 'PASSED') {
      throw new UnprocessableEntityException(
        'counterparty under verification!'
      );
    }

    return new ReceiverEntity(receiver);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, type: ReceiverEntity })
  @ApiOperation({ summary: 'Update existing receiver' })
  async updateReceiver(
    @Req() request: Request,
    @Param('id') cybridCounterpartyId: string,
    @Body() updatedReciever: CreateReceiverDto
  ) {
    const { counterpartyVerify, receiverVerified: receiver } =
      await this.receiversService.update(
        cybridCounterpartyId,
        updatedReciever,
        request.user?.person_id as string
      );

    if (counterpartyVerify.outcome === 'failed') {
      throw new UnprocessableEntityException(
        `Failed to verify the new counterParty due to ${counterpartyVerify.failure_codes?.join(
          ', '
        )}`
      );
    }

    if (receiver.verification_status === 'EXPIRED') {
      throw new UnprocessableEntityException(
        'Sorry! Verification takes too much time and expired. Please try again.'
      );
    }
    if (receiver.verification_status !== 'PASSED') {
      throw new UnprocessableEntityException(
        'Receiver is still in verification process!'
      );
    }

    return new ReceiverEntity(receiver);
  }
}
