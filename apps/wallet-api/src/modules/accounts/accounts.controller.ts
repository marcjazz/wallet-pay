import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
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
import { CybridAccountEnum } from '../../types/cybrid/enums';
import { AccountsService } from './accounts.service';
import {
  CreateExternalAccountDto,
  CreateWorkflowDto,
  CybridAccountEntity,
  CybridExternalAccountEntity,
  IdentityVerificationEntity,
  VerifyCybridAccountDto,
  WorkflowEntity,
} from './dto/account.dto';
import { verificationStatusFrom } from '../../helpers/utils';

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
    return accounts.map(
      ({ CybridCustomer: customer, ...account }) =>
        new CybridAccountEntity({ ...account, ...customer })
    );
  }

  @Get('externals')
  @ApiOkResponse({ type: [CybridExternalAccountEntity] })
  async findAllExternals(
    @Req() request: Request,
    @Query(
      'verification_status',
      new ParseEnumPipe($Enums.IdentityVerificationStatus, { optional: true })
    )
    verificationStatus: $Enums.IdentityVerificationStatus
  ) {
    const accounts = await this.accountsService.findExternalAccounts(
      request.user?.person_id as string,
      verificationStatus
    );
    return accounts.map((account) => new CybridExternalAccountEntity(account));
  }

  @Post('identity-verification/verify')
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

    let identityVerification;
    if (payload.external_bank_account_id) {
      identityVerification =
        await this.accountsService.verifyCybridExternalAccount(
          payload.external_bank_account_id
        );
    } else
      identityVerification = await this.accountsService.verifyCybridCustomer(
        req.user?.person_id as string
      );

    const verificationStatus = verificationStatusFrom(identityVerification);

    return new IdentityVerificationEntity({
      state: verificationStatus,
      customer_guid: identityVerification.customer_guid as string,
      identity_verification_guid: identityVerification.guid as string,
      persona_inquiry_id: null,
      persona_hosted_link: null,
      external_bank_account_id:
        identityVerification.external_bank_account_guid ?? null,
    });
  }

  @Get('identity-verification/:identity_verification_guid')
  @ApiOkResponse({ type: IdentityVerificationEntity })
  @ApiOperation({
    summary: 'Get the verification details of a customer.',
  })
  async getVerification(
    @Req() req: Request,
    @Param('identity_verification_guid') identityVerificationGuid: string
  ) {
    const identityVerification =
      await this.accountsService.getIndentityVerification(
        req.user?.person_id as string,
        identityVerificationGuid
      );

    const verificationStatus = verificationStatusFrom(identityVerification);

    return new IdentityVerificationEntity({
      state: verificationStatus,
      customer_guid: identityVerification.customer_guid as string,
      identity_verification_guid: identityVerification.guid as string,
      persona_inquiry_id: identityVerification.persona_inquiry_id ?? null,
      persona_hosted_link: identityVerification.persona_inquiry_id
        ? `https://withpersona.com/verify?inquiry-id=${identityVerification.persona_inquiry_id}`
        : null,
      external_bank_account_id:
        identityVerification.external_bank_account_guid ?? null,
    });
  }

  @Post('plaid-connect/init')
  @ApiCreatedResponse({
    schema: { properties: { workflow_guid: { type: 'string' } } },
  })
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

    return { workflow_guid: workflowGuid };
  }

  @Get('plaid-connect/:workflow_guid')
  @ApiOkResponse({ type: WorkflowEntity })
  @ApiOperation({
    summary: 'Get the workflow details by workflow GUID.',
  })
  async getWorkflow(
    @Req() req: Request,
    @Param('workflow_guid') workflowGuid: string
  ) {
    const workflow = await this.accountsService.getWorkflow(
      req.user?.person_id as string,
      workflowGuid
    );

    return new WorkflowEntity(workflow);
  }

  @Post('new-external-account')
  @ApiCreatedResponse({ type: CybridExternalAccountEntity })
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
    return new CybridExternalAccountEntity(externalAccount);
  }
}
