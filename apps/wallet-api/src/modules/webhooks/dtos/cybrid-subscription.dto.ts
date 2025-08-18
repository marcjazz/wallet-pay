import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import {
  CybridSubcriptionEvents,
  UnsupportedCybridSubcriptionEvents,
} from '../../../types/cybrid/enums';

export class CybridSubscriptionEventObjectDto {
  @IsString()
  @ApiProperty()
  guid: string;

  @IsString()
  @ApiProperty()
  organization_guid: string;

  @IsEnum(CybridSubcriptionEvents)
  @ApiProperty({ enum: CybridSubcriptionEvents })
  event_type: CybridSubcriptionEvents;

  @IsString()
  @ApiProperty()
  object_guid: string;

  @IsString()
  @ApiProperty()
  environment: 'sandbox' | 'production';

  constructor(props: CybridSubscriptionEventObjectDto) {
    Object.assign(this, props);
  }
}

export class UnsupportedCybridSubcriptionEventObjectDto extends PickType(
  CybridSubscriptionEventObjectDto,
  ['guid', 'environment', 'object_guid'] as const
) {
  @IsEnum(UnsupportedCybridSubcriptionEvents)
  @ApiProperty({ enum: UnsupportedCybridSubcriptionEvents })
  event_type: UnsupportedCybridSubcriptionEvents;

  constructor(props: UnsupportedCybridSubcriptionEventObjectDto) {
    super(props);
    Object.assign(this, props);
  }
}
