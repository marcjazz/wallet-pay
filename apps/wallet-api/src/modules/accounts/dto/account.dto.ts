import { ApiProperty } from '@nestjs/swagger';
import { $Enums, CybridAccount } from '@prisma/client';
import { CybridKycState } from '../../../types/cybrid/enums';

export class CybridAccountEntity implements CybridAccount {
  @ApiProperty()
  cybrid_account_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: $Enums.IdentityVerificationStatus, nullable: true })
  verification_status: $Enums.IdentityVerificationStatus | null =
    $Enums.IdentityVerificationStatus.WAITING;

  @ApiProperty()
  cybrid_account_guid: string;

  @ApiProperty({ nullable: true })
  identity_verification_guid: string | null;

  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  cybrid_customer_id: string;

  @ApiProperty({ enum: $Enums.CybridAccountType })
  account_type: $Enums.CybridAccountType;

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
