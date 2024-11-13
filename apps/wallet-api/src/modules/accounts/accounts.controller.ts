import {
  Body,
  Controller,
  Get,
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
import { OTPService } from '../../app/two-fa/otp/otp.service';
import { CybridAccountEnum } from '../../types/cybrid/enums';
import { AccountsService } from './accounts.service';
import {
  CreatedWorkFlowDto,
  CreateExternalAccountDto,
  CreateWorkflowDto,
  CybridAccountEntity,
  CybridExternalAccountEntity,
  ExternalBankAccountEntity,
  IdentityVerificationEntity,
  VerifyCybridAccountDto,
  WorkflowEntity,
} from './dto/account.dto';

@ApiBearerAuth()
@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly otpService: OTPService,
    private readonly accountsService: AccountsService
  ) {}

  @Get()
  @ApiOkResponse({ type: [CybridAccountEntity] })
  async findAll(@Req() request: Request) {
    const accounts = await this.accountsService.findAccounts(
      request.user?.person_id as string
    );
    return accounts.map(
      ({ CybridCustomer: customer, ...account }) =>
        new CybridAccountEntity({ ...account, ...customer })
    );
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
  @ApiCreatedResponse({ type: IdentityVerificationEntity })
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

  @Post('init-plaid-connect')
  @ApiCreatedResponse({ type: CreatedWorkFlowDto })
  @ApiOperation({
    summary: "Connect to customer's external bank account by starting a flow.",
  })
  async createWorkflow(
    @Req() req: Request,
    @Body() createWorkflowDto: CreateWorkflowDto
  ) {
    const { guid: workflowGuid } = await this.accountsService.createWorkflow(
      req.user?.person_id as string,
      createWorkflowDto.redirect_uri
    );

    const workflow = await this.accountsService.getWorkflow(
      req.user?.person_id as string,
      workflowGuid as string
    );

    return new WorkflowEntity(workflow);
  }

  @Post('new-external-account')
  @ApiCreatedResponse({ type: ExternalBankAccountEntity })
  @ApiOperation({
    summary: 'Create new external bank account from data returned by plaid',
  })
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
}
