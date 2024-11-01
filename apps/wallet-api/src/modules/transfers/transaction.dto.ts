import { PostTransferBankModelTransferTypeEnum } from '@cybrid/cybrid-api-bank-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, CybridTransaction } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
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

  @ValidateNested()
  @Type(() => ReceiverPayoutInfoDto)
  @ApiProperty({ type: ReceiverPayoutInfoDto })
  receiver: ReceiverPayoutInfoDto;

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

  @ApiProperty({ type: Date })
  settled_at: Date | null;

  @ApiProperty({ description: 'Provided for local transactions' })
  local_customer_id: string | null;

  @ApiProperty()
  cybrid_account_id: string | null;

  @ApiProperty()
  cybrid_external_account_id: string | null;

  @ApiProperty({ description: 'Receiver payout info' })
  receiver_payout_info_id: string | null;

  @ApiProperty({ description: "Receiver's bank settlement  bank info" })
  receiver_bank_payout_info_id: string | null;

  @Exclude()
  initiated_by: string;

  constructor(props: CybridTransactionEntity) {
    Object.assign(this, props);
  }
}
