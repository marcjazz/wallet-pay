import {
  PersonGender,
  PrismaClient,
  SupportedLocalCurrency,
} from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { logger } from './logger.js';
const prisma = new PrismaClient();

export async function createInitialAdminAcount({
  email,
  password,
  account_number,
}) {
  logger.info('Creating initial admin account...');
  const salt = Number(process.env.SALT_ROUNDS);
  if (isNaN(salt)) {
    logger.error('Invalid SALT_ROUNDS value');
    throw new Error('Invalid SALT_ROUNDS value');
  }

  const hashPassword = hashSync(password, genSaltSync(salt));

  const payload = {
    email,
    birthdate: new Date(),
    first_name: 'XafPay',
    last_name: 'Admin',
    gender: PersonGender.MALE,
    password: hashPassword,
    phone_number: '+1 (703) 899-5276',
    username: 'xafpay237',
    LocalCustomers: {
      create: {
        balance: 0,
        currency: SupportedLocalCurrency.XAF,
        account_number,
      },
    },
  };

  const admin = await prisma.person.upsert({
    create: payload,
    update: payload,
    where: { email },
  });

  logger.success('Successfully created initial admin account.');

  // create platform roles
  logger.info('Creating platform roles...');
  await seedRoles(admin.person_id);
  logger.success('Successfully created platform roles.');

  let personHasRole = await prisma.personHasRole.findFirst({
    where: { Person: { email }, Role: { title: 'admin' } },
  });

  if (!personHasRole) {
    logger.info('Assinging first admin roles...');
    // asign admin role to person admin
    personHasRole = await prisma.personHasRole.create({
      data: {
        Role: { connect: { title: 'admin' } },
        Person: { connect: { email: admin.email } },
      },
    });
  }

  return personHasRole.person_has_role_id;
}

async function seedRoles(adminId) {
  await prisma.role.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'client',
        created_by: adminId,
      },
      {
        title: 'admin',
        created_by: adminId,
      },
    ],
  });
}
