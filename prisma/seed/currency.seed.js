import { CybridSupportedCurrency, PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
const prisma = new PrismaClient();

export async function insertDefaultCurrencyRates(adminId) {
  logger.info('Inserting default currency rates...');

  const admin = await prisma.personHasRole.findUnique({
    where: { person_has_role_id: adminId, Role: { title: 'admin' } },
  });

  if (!admin) {
    throw new Error('Unauthorized admin!');
  }

  await prisma.supportedCurrency.createMany({
    data: [
      {
        created_by: adminId,
        currency: CybridSupportedCurrency.USD,
        xaf_rate: 601,
      },
      {
        created_by: adminId,
        currency: CybridSupportedCurrency.CAD,
        xaf_rate: 418,
      },
    ],
    skipDuplicates: true,
  });

  logger.success('Successfully added default currency rates!');
}
