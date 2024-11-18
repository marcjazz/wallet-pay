import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPositive, IsString, IsUUID } from 'class-validator';

export class ForexCurrencyEntity {
  //   @IsString()
  //   @ApiProperty({ example: 'United States Dollar' })
  //   currency_name: string;

  @IsString()
  @ApiProperty({ example: 'USD' })
  currency: string;

  constructor(props: ForexCurrencyEntity) {
    Object.assign(this, props);
  }
}

export class CurrencyEntity extends ForexCurrencyEntity {
  @IsUUID()
  @ApiProperty({ description: 'currency id. uuid format' })
  supported_currency_id: string;

  @IsString()
  @ApiPropertyOptional({ example: 'United States' })
  currency: string;

  @ApiProperty({ default: true })
  is_active: boolean;

  @IsPositive()
  @ApiProperty()
  xaf_rate: number;

  @ApiProperty()
  last_updated: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  created_by: string;

  constructor(props: CurrencyEntity) {
    super(props);
    Object.assign(this, props);
  }
}
