import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IdentityVerificationStatus } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  @ApiProperty({ example: 'Bangangte, Chumba (CM-OU)' })
  address: string;

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

  @ApiProperty({ enum: IdentityVerificationStatus, default: null })
  @IsEnum(IdentityVerificationStatus)
  verification_status: IdentityVerificationStatus | null;

  constructor(props: ReceiverEntity) {
    Object.assign(this, props);
  }
}

export enum CameroonRegions {
  ADAMAOUA = 'AD',
  CENTRE = 'CE',
  EAST = 'ES',
  FAR_NORTH = 'EN',
  LITTORAL = 'LT',
  NORTH = 'NO',
  NORTH_WEST = 'NW',
  SOUTH = 'SU',
  SOUTH_WEST = 'SW',
  WEST = 'OU',
}

export class AddressDto {
  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @ApiProperty()
  street: string;

  @IsEnum(CameroonRegions)
  @ApiProperty({ enum: CameroonRegions })
  subdivision: CameroonRegions;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  street2: string | null = null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ default: 'CM' })
  country_code = 'CM';

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  postal_code: string | null = null;

  constructor(props: AddressDto) {
    Object.assign(this, props);
  }
}

export class CreateReceiverDto {
  @IsString()
  @ApiProperty()
  fullname: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({ type: AddressDto })
  address: AddressDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  national_id_number: string | null = null;

  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  constructor(props: CreateReceiverDto) {
    Object.assign(this, props);
  }
}
