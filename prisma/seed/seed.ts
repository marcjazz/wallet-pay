import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';
import { CreateAdminAccount, createInitialAdminAcount } from './admin.seed';
import { logger } from './logger';

const prisma = new PrismaClient();
async function main() {
  logger.debug('Seeding initialization started...');

  const environment = process.env.NODE_ENV;
  logger.log(`Running in ${environment} environment...`);

  switch (environment) {
    case 'production': {
      const admin: CreateAdminAccount = {
        email: String(process.env.ADMIN_EMAIL),
        password: String(process.env.ADMIN_PASSWORD),
        account_number: String(process.env.ADMIN_XAF_ACCOUNT_NUMBER),
      };

      return createInitialAdminAcount(admin);
    }
    case 'development':
      const admin: CreateAdminAccount = {
        email: String(process.env.ADMIN_EMAIL ?? 'xafpay-admin@gmail.com'),
        password: String(process.env.ADMIN_PASSWORD ?? 'Strong237!'),
        account_number: String(
          process.env.ADMIN_XAF_ACCOUNT_NUMBER ?? 'XAF-122 123 123'
        ),
      };

      return createInitialAdminAcount(admin);
    case 'test':
      /** data for your test environment */
      break;
    default:
      break;
  }
}

main()
  .then(async () => {
    logger.success('Seeding initialization completed.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
