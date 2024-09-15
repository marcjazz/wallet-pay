import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
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
  CybridAccountEntity,
  IdentityVerificationEntity,
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
    return accounts.map(
      (account) =>
        new CybridAccountEntity({
          state: account.state,
          name: account.name as string,
          balance: account.platform_available as number,
          kyc_state: account.identity_verfication?.state,
          cybrid_account_id: account.cybrid_account_id,
        })
    );
  }

  @Patch(':id/start-kyc')
  @ApiOkResponse({ type: IdentityVerificationEntity })
  @ApiOperation({ summary: 'Initialize KYC process on a user account' })
  async initiateKycProcess(@Param('id') accountId: string) {
    const identityVerfication = await this.accountsService.initiateKycProcess(
      accountId
    );
    return new IdentityVerificationEntity({
      state: identityVerfication.state as CybridKycState,
      customer_guid: identityVerfication.customer_guid as string,
      identity_verification_guid: identityVerfication.guid as string,
    });
  }
}
