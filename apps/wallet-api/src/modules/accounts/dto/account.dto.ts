import {
  PostTransferBankModelTransferTypeEnum,
  WorkflowBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  $Enums,
  CybridAccount,
  CybridExternalAccount,
  CybridTransaction,
} from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CybridKycState } from '../../../types/cybrid/enums';
import { Exclude } from 'class-transformer';

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

  @ApiProperty({ enum: $Enums.CybridExternalAccountStatus })
  status: $Enums.CybridExternalAccountStatus;

  @ApiProperty({ nullable: true })
  identity_verification_guid: string | null;

  @ApiProperty({ nullable: true, enum: $Enums.IdentityVerificationStatus })
  verification_status: $Enums.IdentityVerificationStatus | null;

  @ApiProperty()
  cybrid_customer_id: string;

  constructor(props: ExternalBankAccountEntity) {
    Object.assign(this, props);
  }
}

export class InitiateFundingTransferDto {
  @IsString()
  @ApiProperty()
  cybrid_external_account_id: string;

  @IsEnum(PostTransferBankModelTransferTypeEnum)
  @ApiProperty({ enum: PostTransferBankModelTransferTypeEnum })
  transfer_type: PostTransferBankModelTransferTypeEnum;

  @IsEnum($Enums.CybridSupportedCurrency)
  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  @IsNumber()
  @ApiProperty({ description: 'Amount in currency base unit' })
  amount: number;

  constructor(props: InitiateFundingTransferDto) {
    Object.assign(this, props);
  }
}

export class CybridTransactionEntity implements CybridTransaction {
  @ApiProperty()
  cybrid_transaction_id: string;

  @ApiProperty()
  cybrid_transaction_guid: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  initial_currency: $Enums.CybridSupportedCurrency;

  @ApiProperty()
  converstion_rate: number | null;

  @ApiProperty()
  fees: number;

  @ApiProperty()
  transaction_id: string;

  @ApiProperty({ enum: $Enums.CybridTransactionType })
  transaction_type: $Enums.CybridTransactionType;

  @ApiProperty({ enum: $Enums.CybridTransactionStatus })
  status: $Enums.CybridTransactionStatus;

  @ApiProperty({ type: Date })
  initiated_at: Date;

  @ApiProperty({ type: Date })
  settled_at: Date | null;

  @ApiProperty({ description: 'Provided for local transactions' })
  local_customer_id: string | null;

  @ApiProperty()
  payout_info_id: string | null;

  @ApiProperty()
  bank_info_id: string | null;

  @ApiProperty()
  cybrid_account_id: string | null;

  @ApiProperty()
  cybrid_external_account_id: string | null;

  @Exclude()
  initiated_by: string;

  constructor(props: CybridTransactionEntity) {
    Object.assign(this, props);
  }
}
