import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { Request } from 'express';
import { AccountsService } from './accounts.service';
import {
  CreatedWorkFlowDto,
  CreateExternalAccountDto,
  CreateWorkflowDto,
  CybridAccountEntity,
  CybridExternalAccountEntity,
  CybridTransactionEntity,
  ExternalBankAccountEntity,
  IdentityVerificationEntity,
  InitiateTransferDto,
  VerifyCybridAccountDto,
  WorkflowEntity,
} from './dto/account.dto';
import { CybridAccountEnum } from '../../types/cybrid/enums';

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

  @Get('externals')
  @ApiOkResponse({ type: [CybridAccountEntity] })
  async findAllExternals(@Req() request: Request) {
    const accounts = await this.accountsService.findExternalAccounts(
      request.user?.person_id as string
    );
    return accounts.map((account) => new CybridExternalAccountEntity(account));
  }

  @Post('verify')
  @ApiOkResponse({ type: IdentityVerificationEntity })
  @ApiOperation({
    summary: 'Initialize verification process on a account/external account',
  })
  async verifyCybridAccount(
    @Req() req: Request,
    @Body() payload: VerifyCybridAccountDto
  ) {
    if (
      payload.account_type === CybridAccountEnum.EXTERNAL &&
      !payload.external_bank_account_id
    ) {
      throw new UnprocessableEntityException(
        `External bank account id is required for ${payload.account_type}`
      );
    }

    if (
      payload.account_type === CybridAccountEnum.FIAT &&
      payload.external_bank_account_id
    ) {
      throw new UnprocessableEntityException(
        `External bank account is not required for ${payload.account_type}`
      );
    }

    const identityVerfication = await this.accountsService.verifyCybridAccount(
      payload,
      req.user?.person_id as string
    );
    return new IdentityVerificationEntity({
      state:
        identityVerfication.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
      customer_guid: identityVerfication.customer_guid as string,
      identity_verification_guid: identityVerfication.guid as string,
      persona_inquiry_id: identityVerfication.persona_inquiry_id ?? null,
      persona_hosted_link: identityVerfication.persona_inquiry_id
        ? `https://withpersona.com/verify?inquiry-id=${identityVerfication.persona_inquiry_id}`
        : null,
      external_bank_account_id:
        identityVerfication.external_bank_account_guid ?? null,
    });
  }

  @Post('workflows/new')
  @ApiCreatedResponse({ type: CreatedWorkFlowDto })
  @ApiOperation({
    summary: 'Connect customer external bank account by starting a flow.',
  })
  async createWorkflow(
    @Req() req: Request,
    @Body() createWorkflowDto: CreateWorkflowDto
  ) {
    const workflow = await this.accountsService.createWorkflow(
      req.user?.person_id as string,
      createWorkflowDto.redirect_uri
    );
    return new CreatedWorkFlowDto(workflow);
  }

  @Get('workflows/:guid')
  @ApiOkResponse({ type: WorkflowEntity })
  @ApiOperation({ summary: 'Fetch a created workflow.' })
  async getWorkflow(@Req() req: Request, @Param('guid') workflowGuid: string) {
    const workflow = await this.accountsService.getWorkflow(
      req.user?.person_id as string,
      workflowGuid
    );

    return new WorkflowEntity(workflow);
  }

  @Post('new-external-account')
  @ApiCreatedResponse({ type: ExternalBankAccountEntity })
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
  @ApiCreatedResponse({ type: CybridTransactionEntity })
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
