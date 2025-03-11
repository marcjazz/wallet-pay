import {
  PersonGender,
  Prisma,
  PrismaClient,
  SupportedLocalCurrency,
} from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
const prisma = new PrismaClient();

export type CreateAdminAccount = {
  email: string;
  password: string;
  account_number: string;
};

export async function createInitialAdminAcount({
  email,
  password,
  account_number,
}: CreateAdminAccount) {
  const salt = Number(process.env.SALT_ROUNDS);
  if (isNaN(salt)) {
    throw new Error('Invalid SALT_ROUNDS value');
  }

  const hashPassword = hashSync(password, genSaltSync(salt));

  const payload: Prisma.PersonCreateInput = {
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

  // create platform roles
  await seedRoles(admin.person_id);

  const personHasRole = await prisma.personHasRole.findFirst({
    where: { Person: { email }, Role: { title: 'admin' } },
  });

  if (personHasRole) {
    // asign admin role to person admin
    await prisma.personHasRole.create({
      data: {
        Role: { connect: { title: 'admin' } },
        Person: { connect: { email: admin.email } },
      },
    });
  }
}

async function seedRoles(adminId: string) {
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
