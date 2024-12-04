import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  $Enums,
  CybridTransaction,
  CybridTransactionStatus,
} from '@prisma/client';
import { Exclude, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OTPPayloadDto } from '../../app/two-fa/dto/two-fa.dto';

export class ReceiverPayoutInfoDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  national_id_number: string | null = null;

  @IsPhoneNumber('CM')
  @IsOptional()
  @ApiPropertyOptional({ description: 'Receiver Cameroonian phone number.' })
  phone_number: string | null = null;

  @IsString()
  @ApiProperty()
  receiver_id: string;

  constructor(props: ReceiverPayoutInfoDto) {
    Object.assign(this, props);
  }
}

export class InitiateFundingTransferDto {
  @IsString()
  @ApiProperty({
    description:
      'customer internal or external account unique identifier in our database',
  })
  cybrid_source_account_id: string;

  @IsNumber()
  @ApiProperty({ description: 'Amount in USD, CAD' })
  amount: number;

  @ValidateNested()
  @Type(() => OTPPayloadDto)
  @ApiProperty({
    type: OTPPayloadDto,
    description: 'One time password received by email or any external channel',
  })
  otp: OTPPayloadDto;

  constructor(props: InitiateFundingTransferDto) {
    Object.assign(this, props);
  }
}

export class InitiateRemittanceDto extends InitiateFundingTransferDto {
  @ValidateNested()
  @Type(() => ReceiverPayoutInfoDto)
  @ApiProperty({
    type: ReceiverPayoutInfoDto,
    description: 'Required for book',
  })
  receiver: ReceiverPayoutInfoDto;

  constructor(props: InitiateRemittanceDto) {
    super(props);
    Object.assign(this, props);
  }
}

export class CybridTransactionEntity implements CybridTransaction {
  @ApiProperty()
  cybrid_transaction_id: string;

  @ApiProperty()
  cybrid_transaction_guid: string;

  @ApiProperty({
    description: 'Settlement transfer guid for remittance transaction type',
  })
  cybrid_transfer_settlement_guid: string | null = null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  currency: $Enums.CybridSupportedCurrency;

  @ApiProperty()
  initial_currency_amount: number;

  @ApiProperty({ enum: $Enums.CybridSupportedCurrency })
  initial_currency: $Enums.CybridSupportedCurrency;

  @ApiProperty()
  conversion_rate: number | null = null;

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
  settled_at: Date | null = null;

  @ApiProperty({
    nullable: true,
    description: "Envolved customer's fiat account",
  })
  cybrid_account_id: string | null = null;

  @ApiProperty({
    nullable: true,
    description: 'Provided for local transactions',
  })
  local_customer_id: string | null = null;

  @ApiProperty({
    nullable: true,
    description: 'USDC_SOL (Solana) asset account on cybrid',
  })
  cybrid_crypto_account_id: string | null = null;

  @ApiProperty({ nullable: true })
  cybrid_external_account_id: string | null = null;

  @ApiProperty({ nullable: true, description: 'Receiver payout info' })
  receiver_payout_info_id: string | null = null;

  @ApiProperty({
    nullable: true,
    description: "Receiver's bank settlement  bank info",
  })
  receiver_bank_payout_info_id: string | null = null;

  @ApiProperty({
    nullable: true,
    description: 'Receipient can be either payout or cybrid account.',
  })
  reciepient_fullname: string | null = null;

  @ApiProperty({ nullable: true, type: Date })
  payout_at: Date | null;

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
  @ApiPropertyOptional({ enum: ['date', 'amount'] })
  order_by?: 'date' | 'amount';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiPropertyOptional()
  order_direction?: 'asc' | 'desc';

  constructor(props: QueryTransactionDto) {
    Object.assign(this, props);
  }
}
