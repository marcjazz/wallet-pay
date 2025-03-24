import { CybridSupportedCurrency, PrismaClient } from '@prisma/client';

export type CustomerAccountInfo = {
  balance: number;
  customerGuid: string;
  fiatAccountGuid: string;
  cryptoAccountGuid?: string;
  currency: CybridSupportedCurrency;
  externalAccountGuid?: string;
};

export async function resolveAccountInfo(
  prisma: PrismaClient,
  query: {
    personId?: string;
    accountId: string;
    purpose: 'book' | 'funding';
  }
) {
  let customerAccount: CustomerAccountInfo | null = null;
  if (query.purpose === 'book') {
    const cybridAccount = await prisma.cybridAccount.findFirst({
      select: {
        balance: true,
        currency: true,
        cybrid_account_guid: true,
        CybridCustomer: {
          select: {
            cybrid_customer_guid: true,
            CybridAccounts: {
              take: 1,
              select: { cybrid_account_guid: true },
              where: { currency: 'USDC_SOL' },
            },
          },
        },
      },
      where: {
        cybrid_account_id: query.accountId,
        ...(query.personId
          ? { CybridCustomer: { person_id: query.personId } }
          : {}),
      },
    });

    if (cybridAccount) {
      const {
        balance,
        currency,
        CybridCustomer: customer,
        cybrid_account_guid: fiatAccountGuid,
      } = cybridAccount;

      customerAccount = {
        currency,
        fiatAccountGuid,
        // converting stored balance back to cents
        balance: balance * 100,
        customerGuid: customer.cybrid_customer_guid,
        cryptoAccountGuid: customer.CybridAccounts[0].cybrid_account_guid,
      };
    }
  } else {
    const externalAccount = await prisma.cybridExternalAccount.findFirst({
      select: {
        currency: true,
        balance: true,
        cybrid_external_account_guid: true,
        CybridCustomer: {
          select: {
            cybrid_customer_guid: true,
            CybridAccounts: {
              take: 1,
              select: {
                cybrid_account_guid: true,
              },
              where: { currency: 'USD' },
            },
          },
        },
      },
      where: {
        cybrid_external_account_id: query.accountId,
        ...(query.personId
          ? { CybridCustomer: { person_id: query.personId } }
          : {}),
      },
    });
    if (externalAccount) {
      const {
        CybridCustomer: {
          cybrid_customer_guid,
          CybridAccounts: [{ cybrid_account_guid }],
        },
        currency,
        balance,
        cybrid_external_account_guid,
      } = externalAccount;
      customerAccount = {
        currency,
        // converting stored balance back to cents
        balance: balance * 100,
        fiatAccountGuid: cybrid_account_guid,
        customerGuid: cybrid_customer_guid,
        externalAccountGuid: cybrid_external_account_guid,
      };
    }
  }
  return customerAccount;
}
