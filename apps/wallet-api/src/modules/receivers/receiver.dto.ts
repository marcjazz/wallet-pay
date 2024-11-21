import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class ReceiverEntity {
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
  @ApiProperty({ name: 'receiver_id' })
  @Expose({ name: 'receiver_id' })
  cybrid_counterparty_id: string;

  @IsString()
  @ApiProperty({ name: 'receiver_guid' })
  @Expose({ name: 'receiver_guid' })
  cybrid_counterparty_guid: string;

  @Exclude()
  @ApiHideProperty()
  person_id: string;

  @ApiProperty()
  created_at: Date;

  constructor(props: ReceiverEntity) {
    Object.assign(this, props);
  }
}
export class ReceiverPayoutInfoDto {
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
  @IsOptional()
  @ApiPropertyOptional({ name: 'receiver_id' })
  @Expose({ name: 'receiver_id' })
  cybrid_counterparty_id: string | null = null;

  constructor(props: ReceiverPayoutInfoDto) {
    Object.assign(this, props);
  }
}
