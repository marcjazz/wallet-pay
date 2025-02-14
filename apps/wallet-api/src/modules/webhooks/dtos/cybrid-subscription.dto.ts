import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { CybridSubcriptionEvents } from '../../../types/cybrid/enums';
import { ApiProperty } from '@nestjs/swagger';

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

  @IsBoolean()
  @ApiProperty()
  environment: 'sandbox' | 'production';

  constructor(props: CybridSubscriptionEventObjectDto) {
    Object.assign(this, props);
  }
}
