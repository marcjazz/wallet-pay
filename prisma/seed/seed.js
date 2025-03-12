import { PrismaClient } from '@prisma/client';
import { createInitialAdminAcount } from './admin.seed.js';
import { logger } from './logger.js';

const prisma = new PrismaClient();
async function main() {
  logger.debug('Seeding initialization started...');

  const environment = process.env.NODE_ENV;
  logger.log(`Running in ${environment} environment...`);

  switch (environment) {
    case 'production': {
      const admin = {
        email: String(process.env.APP_EMAIL),
        password: String(process.env.APP_EMAIL_PASS),
        account_number: String(process.env.ADMIN_XAF_ACCOUNT_NUMBER),
      };

      return createInitialAdminAcount(admin);
    }
    case 'development':
      const admin = {
        email: String(process.env.APP_EMAIL ?? 'xafpay@gmail.com'),
        password: String(process.env.APP_EMAIL_PASS ?? 'Strong237!'),
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
