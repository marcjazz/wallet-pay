import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchQueryDto } from '../../app/app.dto';
import { CounterpartiesService } from './counterparties.service';
import { CounterpartyEntity } from './counterparty.dto';

@ApiBearerAuth()
@ApiTags('Counterparties')
@Controller('counterparties')
export class CounterpartiesController {
  constructor(private readonly counterpartiesService: CounterpartiesService) {}

  @Get()
  async findCounterparties(@Query() query: SearchQueryDto) {
    const counterparties = await this.counterpartiesService.findAll(query);
    return counterparties.map(
      (counterparty) => new CounterpartyEntity(counterparty)
    );
  }

  @Get(':id')
  async findCounterparty(@Param('id') cybridCounterpartyId: string) {
    const counterparty = await this.counterpartiesService.findOne(
      cybridCounterpartyId
    );

    if (!counterparty) {
      throw new NotFoundException(
        `Counterparty with ID ${cybridCounterpartyId} not found!`
      );
    }

    return new CounterpartyEntity(counterparty);
  }
}
