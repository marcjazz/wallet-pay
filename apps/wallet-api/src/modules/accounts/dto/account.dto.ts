import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CybridKycState } from '../../../types/cybrid/enums';

export class CybridAccountEntity {
  @IsString()
  @ApiProperty()
  cybrid_account_id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  balance: number;

  @IsOptional()
  @IsEnum(CybridKycState)
  @ApiProperty({ enum: CybridKycState })
  state?: string = CybridKycState.WAITING;

  @IsOptional()
  @IsEnum(CybridKycState)
  @ApiProperty({ enum: CybridKycState })
  kyc_state?: string = CybridKycState.WAITING;

  constructor(props: CybridAccountEntity) {
    Object.assign(this, props);
  }
}

export class IdentityVerificationEntity {
  @ApiProperty()
  identity_verification_guid: string;

  @ApiProperty()
  customer_guid: string;

  @ApiProperty({ enum: CybridKycState })
  state: CybridKycState;

  constructor(props: IdentityVerificationEntity) {
    Object.assign(this, props);
  }
}
