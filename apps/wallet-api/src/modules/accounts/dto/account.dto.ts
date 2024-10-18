import {
  WorkflowBankModel
} from '@cybrid/cybrid-api-bank-typescript';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, CybridAccount, CybridExternalAccount } from '@prisma/client';
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

export class CreatedWorkFlowDto implements WorkflowBankModel {
  @ApiPropertyOptional()
  guid?: string;

  @ApiPropertyOptional({ nullable: true })
  bank_guid?: string | null;

  @ApiPropertyOptional({ nullable: true })
  customer_guid?: string | null;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional({ nullable: true })
  failure_code?: string | null;

  @ApiPropertyOptional()
  created_at?: string;

  @ApiPropertyOptional()
  updated_at?: string;

  constructor(props: CreatedWorkFlowDto) {
    Object.assign(this, props);
  }
}

export class WorkflowEntity extends CreatedWorkFlowDto {
  @ApiPropertyOptional({ nullable: true })
  plaid_link_token?: string | null;

  constructor(props: WorkflowEntity) {
    super(props);
    Object.assign(this, props);
  }
}

export class CreateExternalAccountDto {
  @ApiProperty()
  plaid_link_token: string;

  @ApiProperty()
  plaid_account_id: string;

  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  constructor(props: CreatedWorkFlowDto) {
    Object.assign(this, props);
  }
}

export class ExternalBankAccountEntity implements CybridExternalAccount {
  @ApiProperty()
  cybrid_external_account_id: string;

  @ApiProperty()
  cybrid_external_account_guid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  status: $Enums.CybridExternalAccountStatus;

  @ApiProperty({ nullable: true })
  identity_verification_guid: string | null;

  @ApiProperty({ nullable: true })
  verification_status: $Enums.IdentityVerificationStatus | null;

  @ApiProperty()
  cybrid_customer_id: string;

  constructor(props: ExternalBankAccountEntity) {
    Object.assign(this, props);
  }
}
