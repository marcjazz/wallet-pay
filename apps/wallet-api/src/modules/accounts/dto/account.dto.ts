import { WorkflowBankModel } from '@cybrid/cybrid-api-bank-typescript';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, CybridAccount, CybridExternalAccount } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CybridAccountEnum } from '../../../types/cybrid/enums';

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

  constructor(props: CybridAccountEntity) {
    Object.assign(this, props);
  }
}

export class IdentityVerificationEntity {
  @ApiProperty()
  identity_verification_guid: string;

  @ApiProperty()
  customer_guid: string;

  @ApiProperty({ enum: $Enums.IdentityVerificationStatus })
  state: $Enums.IdentityVerificationStatus;

  @ApiProperty({
    description: 'Required for external bank account verification',
  })
  external_bank_account_id: string | null;

  @ApiProperty({
    description: 'Persona inquiry id for identity verification completion',
  })
  persona_inquiry_id: string | null;

  @ApiProperty({
    description: 'Persona hosted link for identity verification completion',
  })
  persona_hosted_link: string | null;

  constructor(props: IdentityVerificationEntity) {
    Object.assign(this, props);
  }
}

export class WorkflowEntity implements WorkflowBankModel {
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

  @ApiPropertyOptional({ nullable: true })
  plaid_link_token?: string | null;

  constructor(props: WorkflowEntity) {
    Object.assign(this, props);
  }
}

export class CreateExternalAccountDto {
  @IsString()
  @ApiProperty()
  plaid_public_token: string;

  @IsString()
  @ApiProperty()
  plaid_account_id: string;

  @IsString()
  @ApiProperty()
  plaid_account_mask: string;

  @IsEnum($Enums.CybridSupportedCurrency)
  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  constructor(props: CreateExternalAccountDto) {
    Object.assign(this, props);
  }
}

export class CybridExternalAccountEntity implements CybridExternalAccount {
  @ApiProperty()
  cybrid_external_account_id: string;

  @ApiProperty()
  cybrid_external_account_guid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  @ApiProperty({ default: true })
  is_active: boolean;

  @ApiProperty({ nullable: true })
  mask: string | null;

  @ApiProperty({ enum: $Enums.CybridExternalAccountStatus })
  status: $Enums.CybridExternalAccountStatus;

  @ApiProperty({ nullable: true })
  identity_verification_guid: string | null;

  @ApiProperty({ nullable: true, enum: $Enums.IdentityVerificationStatus })
  verification_status: $Enums.IdentityVerificationStatus | null;

  @ApiProperty()
  cybrid_customer_id: string;

  constructor(props: CybridExternalAccountEntity) {
    Object.assign(this, props);
  }
}

export class CreateWorkflowDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The redirect URI for Plaid link. Optional when type is plaid.',
  })
  redirect_uri?: string;

  constructor(props: CreateWorkflowDto) {
    Object.assign(this, props);
  }
}

export class VerifyCybridAccountDto {
  @IsEnum(CybridAccountEnum)
  @ApiProperty({ enum: CybridAccountEnum })
  account_type: CybridAccountEnum;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Required when account type is external',
  })
  external_bank_account_id?: string;

  constructor(props: VerifyCybridAccountDto) {
    Object.assign(this, props);
  }
}
