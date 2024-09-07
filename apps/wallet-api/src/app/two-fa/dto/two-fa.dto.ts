import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { OTP } from '@prisma/client';
import { IsString } from 'class-validator';
import { TwoFAUsage } from '../two-fa.interface';
import { Exclude } from 'class-transformer';

export class VerifyOTPDto {
  @IsString()
  @ApiProperty()
  otp_id: string;

  @IsString()
  @ApiProperty()
  code: string;

  constructor(props: VerifyOTPDto) {
    Object.assign(this, props);
  }
}

export class OTPEntity implements OTP {
  @ApiProperty()
  otp_id: string;

  @Exclude()
  @ApiHideProperty()
  code: string;

  @ApiProperty({ enum: TwoFAUsage })
  usage: string;

  @ApiProperty()
  is_used: boolean;

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
