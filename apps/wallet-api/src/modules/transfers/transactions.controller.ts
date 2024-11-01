import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CybridTransactionEntity, InitiateTransferDto } from './transaction.dto';
import { TransactionsService } from './transactions.service';
import { TwoFAUsage } from '../../app/two-fa/two-fa.interface';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OTPService } from '../../app/two-fa/otp/otp.service';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly otpService: OTPService,
    private readonly transactionsService: TransactionsService
  ) {}

  @Post('initiate')
  @ApiCreatedResponse({ type: CybridTransactionEntity })
  @ApiOperation({
    summary: 'Initialize a transfer on a given account.',
    description:
      'Initialize a transfer on a given account. Only book, funding or instant funding are currently supported',
  })
  async initiateTransfer(
    @Req() req: Request,
    @Body() { otp, ...payload }: InitiateTransferDto
  ) {
    const isVerified = await this.otpService.verify(
      otp.otp_id,
      otp.code,
      TwoFAUsage.TRANSFER
    );

    if (!isVerified) {
      throw new UnauthorizedException(`Invalid One time password`);
    }

    const transfer = await this.transactionsService.initiateTransfer(
      req.user?.id as string,
      payload
    );

    return new CybridTransactionEntity(transfer);
  }
}
