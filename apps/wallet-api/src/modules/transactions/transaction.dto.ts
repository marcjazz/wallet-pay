import { PostTransferBankModelTransferTypeEnum } from '@cybrid/cybrid-api-bank-typescript';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  $Enums,
  CybridTransaction,
  CybridTransactionStatus,
} from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OTPPayloadDto } from '../../app/two-fa/dto/two-fa.dto';
import { ReceiverPayoutInfoDto } from '../accounts/dto/account.dto';

export class InitiateTransferDto {
  @IsString()
  @ApiProperty({
    description:
      'customer internal or external account unique identifier in our database',
  })
  cybrid_source_account_id: string;

  @IsEnum(PostTransferBankModelTransferTypeEnum)
  @ApiProperty({ enum: PostTransferBankModelTransferTypeEnum })
  transfer_type: PostTransferBankModelTransferTypeEnum;

  @IsEnum($Enums.CybridSupportedCurrency)
  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  @IsNumber()
  @ApiProperty({ description: 'Amount in currency base unit' })
  amount: number;

  @ValidateNested()
  @Type(() => OTPPayloadDto)
  @ApiProperty({
    type: OTPPayloadDto,
    description: 'One time password received by email or any external channel',
  })
  otp: OTPPayloadDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReceiverPayoutInfoDto)
  @ApiPropertyOptional({ type: ReceiverPayoutInfoDto })
  receiver: ReceiverPayoutInfoDto | null = null;

  constructor(props: InitiateTransferDto) {
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

  @ApiProperty({ nullable: true, type: Date })
  settled_at: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Provided for local transactions',
  })
  local_customer_id: string | null;

  @ApiProperty()
  cybrid_account_id: string | null;

  @ApiProperty()
  cybrid_external_account_id: string | null;

  @ApiProperty({ nullable: true, description: 'Receiver payout info' })
  receiver_payout_info_id: string | null;

  @ApiProperty({
    nullable: true,
    description: "Receiver's bank settlement  bank info",
  })
  receiver_bank_payout_info_id: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Receipient can be either payout or cybrid account.',
  })
  reciepient_fullname: string | null;

  @Exclude()
  initiated_by: string;

  constructor(props: CybridTransactionEntity) {
    Object.assign(this, props);
  }
}

export class QueryTransactionDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @IsEnum(CybridTransactionStatus)
  @ApiPropertyOptional({ enum: CybridTransactionStatus })
  status?: CybridTransactionStatus;

  @IsOptional()
  @IsIn(['date', 'amount'])
  @ApiPropertyOptional()
  order_by?: 'date' | 'amount';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiPropertyOptional()
  order_direction?: 'asc' | 'desc';

  constructor(props: QueryTransactionDto) {
    Object.assign(this, props);
  }
}
