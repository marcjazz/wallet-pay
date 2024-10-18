import { Injectable, NotFoundException } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExternalAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async findAccounts(personId: string) {
    const cybridAccounts = await this.prismaService.cybridAccount.findMany({
      where: { CybridCustomer: { person_id: personId } },
    });
    return cybridAccounts;
  }

  async initiateVerificationProcess(accountId: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { CybridAccounts: { some: { cybrid_account_id: accountId } } },
    });
    if (!customer) {
      throw new NotFoundException('Customer account not found!');
    }

    const identityVerification =
      await this.cybridService.createIdentityVerification(
        customer.cybrid_customer_guid
      );

    await this.prismaService.cybridCustomer.updateMany({
      data: { identity_verification_guid: identityVerification.guid },
      where: { cybrid_customer_id: customer.cybrid_customer_id },
    });

    return this.cybridService.getIdentityVerification(
      identityVerification.guid as string
    );
  }

  async findExternalAccounts(personId: string) {
    const cybridCustomers =
      await this.prismaService.cybridExternalAccount.findMany({
        where: { CybridCustomer: { person_id: personId } },
      });
    return cybridCustomers;
  }

  async createWorkflow(personId: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }
    return this.cybridService.createWorkflow(customer.cybrid_customer_guid);
  }

  async getWorkflow(personId: string, workflowGuid: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }

    return this.cybridService.getWorkflow(
      customer.cybrid_customer_guid,
      workflowGuid
    );
  }

  async createExternalAccount(
    payload: CreateExternalAccountDto,
    personId: string
  ) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }

    const externalAccount = await this.cybridService.createExternalBankAccount(
      customer.cybrid_customer_guid,
      payload.plaid_account_id,
      payload.plaid_link_token,
      payload.currency
    );

    return this.prismaService.cybridExternalAccount.create({
      data: {
        name: externalAccount.name ?? '',
        balance: externalAccount.balances?.available ?? 0,
        cybrid_external_account_guid: externalAccount.guid as string,
        status: externalAccount.state as $Enums.CybridExternalAccountStatus,
        CybridCustomer: {
          connect: { cybrid_customer_id: customer.cybrid_customer_id },
        },
      },
    });
  }
}
