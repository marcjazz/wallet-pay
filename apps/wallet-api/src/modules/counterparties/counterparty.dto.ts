import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CounterpartyEntity {
  @IsString()
  @ApiProperty()
  fullname: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  national_id_number: string | null = null;

  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  @IsString()
  @ApiProperty()
  cybrid_counterparty_id: string;

  @IsString()
  @ApiProperty()
  cybrid_counterparty_guid: string;

  @Exclude()
  @ApiHideProperty()
  person_id: string;

  @ApiProperty()
  created_at: Date;

  constructor(props: CounterpartyEntity) {
    Object.assign(this, props);
  }
}
