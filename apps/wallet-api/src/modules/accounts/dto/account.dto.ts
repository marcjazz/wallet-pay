import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CybridKycState } from '../../../types/cybrid/enums';

export class AccountEntity {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  balance: number;

  @IsOptional()
  @IsEnum(CybridKycState)
  @ApiProperty({ enum: CybridKycState })
  state?: string;

  constructor(props: AccountEntity) {
    Object.assign(this, props);
  }
}
