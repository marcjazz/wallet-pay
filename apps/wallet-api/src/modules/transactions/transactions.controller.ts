import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OTPService } from '../../app/two-fa/otp/otp.service';
import { TwoFAUsage } from '../../app/two-fa/two-fa.interface';
import {
  CybridTransactionEntity,
  InitiateFundingTransferDto,
  InitiateRemittanceDto,
  QueryTransactionDto,
} from './transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly otpService: OTPService,
    private readonly transactionsService: TransactionsService
  ) {}

  @Post('fund')
  @ApiCreatedResponse({ type: CybridTransactionEntity })
  @ApiOperation({
    summary: 'Initialize a transfer on a given account.',
    description:
      'Initialize a transfer on a given account. Only book, funding or instant funding are currently supported',
  })
  async initiateFundingTransfer(
    @Req() req: Request,
    @Body() payload: InitiateFundingTransferDto
  ) {
    const isVerified = await this.otpService.verify(
      payload.otp.otp_id,
      payload.otp.code,
      TwoFAUsage.TRANSFER
    );

    if (!isVerified) {
      throw new UnauthorizedException(`Invalid One time password`);
    }

    return this.transactionsService.initiateInstantFunding(
      // Convert amount to cents
      { ...payload, amount: payload.amount * 100 },
      req.user?.person_id as string
    );
  }

  @Post('remit')
  @ApiCreatedResponse({ type: CybridTransactionEntity })
  @ApiOperation({
    summary: 'Initialize a transfer on a given account.',
    description:
      'Initialize a transfer on a given account. Only book, funding or instant funding are currently supported',
  })
  async initiateTransfer(
    @Req() req: Request,
    @Body() payload: InitiateRemittanceDto
  ) {
    const isVerified = await this.otpService.verify(
      payload.otp.otp_id,
      payload.otp.code,
      TwoFAUsage.TRANSFER
    );

    if (!isVerified) {
      throw new UnauthorizedException(`Invalid One time password`);
    }

    return this.transactionsService.initiateRemittance(
      // Convert amount to cents
      { ...payload, amount: payload.amount * 100 },
      req.user?.person_id as string
    );
  }

  @Get()
  @ApiCreatedResponse({ type: [CybridTransactionEntity] })
  @ApiOperation({ summary: 'Get all transactions' })
  async getTransactions(
    @Req() req: Request,
    @Query() params: QueryTransactionDto
  ) {
    return this.transactionsService.getTransactions(
      params,
      req.user?.person_id as string
    );
  }

  @Get(':id')
  @ApiCreatedResponse({ type: CybridTransactionEntity })
  @ApiOperation({ summary: 'Get transaction' })
  async getTransaction(@Param('id') transactionId: string) {
    return this.transactionsService.getTransaction(transactionId);
  }
}
