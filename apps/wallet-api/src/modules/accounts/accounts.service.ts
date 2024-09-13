import { Injectable } from '@nestjs/common';
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
    const customers = await this.prismaService.cybridCustomer.findMany({
      where: { person_id: personId },
    });
    const accounts = await Promise.all(
      customers.flatMap(
        async ({ cybrid_customer_guid, identity_verification_guid }) => {
          const { objects } = await this.cybridService.getAccounts(
            cybrid_customer_guid
          );
          if (identity_verification_guid) {
            const identityVerfication =
              await this.cybridService.getIdentityVerification(
                identity_verification_guid
              );
            return objects.map((object) => ({
              ...object,
              identity_verification: identityVerfication,
            }));
          }
          return objects;
        }
      )
    );
    return accounts.flat();
  }
}
