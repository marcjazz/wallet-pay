import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { CybridSubcriptionEvents } from '../../../types/cybrid/enums';

export class CybridSubscriptionEventObjectDto {
  @IsString()
  guid: string;

  @IsString()
  organization_guid: string;

  @IsEnum(CybridSubcriptionEvents)
  event_type: CybridSubcriptionEvents;

  @IsString()
  object_guid: string;

  @IsBoolean()
  sandbox: boolean;

  constructor(props: CybridSubscriptionEventObjectDto) {
    Object.assign(this, props);
  }
}
