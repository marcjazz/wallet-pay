import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CybridKycState } from '../../types/cybrid/enums';
import { AccountsService } from './accounts.service';
import {
  CreatedWorkFlowDto,
  CreateExternalAccountDto,
  InitiateTransferDto,
  CybridAccountEntity,
  ExternalBankAccountEntity,
  IdentityVerificationEntity,
  WorkflowEntity,
  CybridTransactionEntity,
} from './dto/account.dto';

@ApiBearerAuth()
@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOkResponse({ type: [CybridAccountEntity] })
  async findAll(@Req() request: Request) {
    const accounts = await this.accountsService.findAccounts(
      request.user?.person_id as string
    );
    return accounts.map((account) => new CybridAccountEntity(account));
  }

  @Patch(':id/verify')
  @ApiOkResponse({ type: IdentityVerificationEntity })
  @ApiOperation({
    summary: 'Initialize verification process on a user account',
  })
  async initiateVerificationProcess(@Param('id') accountId: string) {
    const identityVerfication =
      await this.accountsService.initiateVerificationProcess(accountId);
    return new IdentityVerificationEntity({
      state: identityVerfication.state as CybridKycState,
      customer_guid: identityVerfication.customer_guid as string,
      identity_verification_guid: identityVerfication.guid as string,
    });
  }

  @Post('workflows/new')
  @ApiOkResponse({ type: ExternalBankAccountEntity })
  @ApiOperation({
    summary: 'Connect customer external bank account by starting a flow.',
  })
  async createWorkflow(@Req() req: Request) {
    const workflow = await this.accountsService.createWorkflow(
      req.user?.person_id as string
    );
    return new CreatedWorkFlowDto(workflow);
  }

  @Get('workflows/:id')
  @ApiOkResponse({ type: ExternalBankAccountEntity })
  @ApiOperation({ summary: 'Fetch a created workflow.' })
  async getWorkflow(@Req() req: Request, @Param('id') workflowGuid: string) {
    const workflow = await this.accountsService.getWorkflow(
      req.user?.person_id as string,
      workflowGuid
    );

    return new WorkflowEntity(workflow);
  }

  @Patch('new-external-account')
  @ApiOkResponse({ type: ExternalBankAccountEntity })
  @ApiOperation({ summary: 'Initialize KYC process on a user account' })
  async startExternalPlaidLink(
    @Req() req: Request,
    @Body() payload: CreateExternalAccountDto
  ) {
    const externalAccount = await this.accountsService.createExternalAccount(
      payload,
      req.user?.person_id as string
    );
    return new ExternalBankAccountEntity(externalAccount);
  }

  @Post(':id/initiate-transfer')
  @ApiOkResponse({ type: CybridTransactionEntity })
  @ApiOperation({
    summary: 'Initialize a transfer on a given account.',
    description:
      'Initialize a transfer on a given account. Only book, funding or instant funding are currently supported',
  })
  async initiateTransfer(
    @Req() req: Request,
    @Body() payload: InitiateTransferDto
  ) {
    const transaction = await this.accountsService.initiateTransfer(
      req.user?.person_id as string,
      payload
    );

    return new CybridTransactionEntity(transaction);
  }
}
