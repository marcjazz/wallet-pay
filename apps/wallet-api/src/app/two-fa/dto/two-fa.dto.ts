import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { OTP } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { TwoFAUsage } from '../two-fa.interface';

export class OTPPayloadDto {
  @IsString()
  @ApiProperty()
  otp_id: string;

  @IsString()
  @ApiProperty()
  code: string;

  constructor(props: OTPPayloadDto) {
    Object.assign(this, props);
  }
}

export class OTPCodeDto extends OmitType(OTPPayloadDto, ['otp_id']) {}

export class OTPEntity implements OTP {
  @ApiProperty()
  otp_id: string;

  @Exclude()
  @ApiHideProperty()
  code: string;

  @IsEnum(TwoFAUsage)
  @ApiProperty({ enum: TwoFAUsage })
  usage: TwoFAUsage;

  @ApiProperty()
  is_verified: boolean;

  @ApiProperty()
  expires_at: Date;

  @ApiProperty({ nullable: true })
  updated_at: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  person_has_role_id: string;

  constructor(props: OTPEntity) {
    Object.assign(this, props);
  }
}

export class OTPUsageDto extends PickType(OTPEntity, ['usage']) {}
