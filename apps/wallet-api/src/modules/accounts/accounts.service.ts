import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';

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

  async initiateKycProcess(accountId: string) {
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
}
