import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req
} from '@nestjs/common';
import {
    ApiNoContentResponse,
    ApiOperation,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { Request } from 'express';
import { RoleEnum, Roles, SkipAuth } from '../../app/auth/auth.decorator';
import { CurrenciesService } from './currencies.service';
import { CurrencyEntity, ForexCurrencyEntity } from './currency.dto';

@ApiTags('Currencies')
@Controller('currencies')
@Roles(RoleEnum.ADMIN)
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  @SkipAuth()
  @ApiResponse({ status: 200, type: [CurrencyEntity] })
  @ApiOperation({ summary: 'Fetch all supported currencies' })
  async getCurrencies(@Query('is_active') isActive?: boolean) {
    return await this.currenciesService.findAll(isActive);
  }

  @Get('unsupported')
  @ApiResponse({ status: 200, type: [ForexCurrencyEntity] })
  @ApiOperation({ summary: 'Fetch all unsupported currencies' })
  async getUnsupportedCurrencies() {
    return await this.currenciesService.findUnsupported();
  }

  @Post('new')
  @ApiNoContentResponse({ description: 'OK' })
  @ApiOperation({ summary: 'add new supported currencies' })
  async addNewCurrencies(
    @Req() request: Request,
    @Body() newCurrencies: ForexCurrencyEntity[]
  ) {
    return await this.currenciesService.addMany(
      newCurrencies,
      request.user?.person_id as string
    );
  }

  @Patch([':currency_id/enable', ':currency_id/disable'])
  @ApiNoContentResponse({ description: 'OK' })
  @ApiOperation({ summary: 'enable or disable supported currency' })
  async updateCurrencyState(
    @Req() request: Request,
    @Param('currency_id') currencryId: string
  ) {
    return await this.currenciesService.updateCurrencyState(
      currencryId,
      request.url.includes('enable'),
      request.user?.person_id as string
    );
  }

  @Patch(['enable', 'disable'])
  @ApiNoContentResponse({ description: 'OK' })
  @ApiOperation({ summary: 'enable or disable supported currencies' })
  async updateCurrenciesState(
    @Req() request: Request,
    @Body() currencryIds: string[]
  ) {
    return await this.currenciesService.updateCurrenciesState(
      currencryIds,
      request.url.includes('enable'),
      request.user?.person_id as string
    );
  }
}
