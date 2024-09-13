import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccountsService } from './accounts.service';
import { AccountEntity } from './dto/account.dto';

@ApiBearerAuth()
@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Req() request: Request) {
    const accounts = await this.accountsService.findAccounts(
      request.user?.person_id as string
    );
    return accounts.map(
      (account) =>
        new AccountEntity({
          name: account.name as string,
          balance: account.platform_available as number,
          state: account.identity_verfication?.state,
        })
    );
  }
}
