import { AccountBankModel } from '@cybrid/cybrid-api-bank-typescript';
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CybridAccountWithKYC } from '../../types/cybrid';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async findAccounts(personId: string): Promise<CybridAccountWithKYC[]> {
    const cybridCustomers = await this.prismaService.cybridCustomer.findMany({
      include: { CybridAccounts: true },
      where: { person_id: personId },
    });
    const accounts = await Promise.all(
      cybridCustomers.flatMap(
        async ({
          cybrid_customer_guid,
          identity_verification_guid,
          CybridAccounts: accounts,
        }) => {
          const customer = await this.cybridService.getCustomer(
            cybrid_customer_guid
          );
          const { objects } = await this.cybridService.getAccounts(
            cybrid_customer_guid
          );

          const getCybridAccountId = (object: AccountBankModel) => {
            const id = accounts.find(
              (_) => _.cybrid_account_guid === object.guid
            )?.cybrid_account_id;
            if (!id) {
              throw new InternalServerErrorException(
                'Could not look up ID from cybrid!'
              );
            }
            return id;
          };

          if (identity_verification_guid) {
            const identityVerfication =
              await this.cybridService.getIdentityVerification(
                identity_verification_guid
              );
            return objects.map((object) => ({
              ...object,
              state: customer.state,
              cybrid_account_id: getCybridAccountId(object),
              identity_verification: identityVerfication,
            }));
          }
          return objects.map((object) => ({
            ...object,
            cybrid_account_id: getCybridAccountId(object),
          }));
        }
      )
    );
    return accounts.flat();
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
}
