import { PrismaClient, SupportedLocalCurrency } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { generateAccountNumber } from '../../helpers/otp-generator';
const prisma = new PrismaClient();

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function main() {
  // create admin
  await seedAdminAcount();
}

async function seedAdminAcount() {
  const password = hashSync(
    process.env.ADMIN_PASSWORD || 'xafpay237!',
    genSaltSync(Number(process.env.SALT_ROUNDS))
  );

  const admin = await prisma.person.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@xafpay.com',
      birthdate: new Date(),
      first_name: 'XafPay',
      last_name: 'Admin',
      gender: 'MALE',
      password,
      phone_number: '+1 (703) 899-5276',
      username: 'xafpay-237',
      LocalCustomers: {
        create: {
          balance: 0,
          currency: SupportedLocalCurrency.XAF,
          account_number:
            process.env.ADMIN_ACCOUNT || generateAccountNumber('XAFPAY-'),
        },
      },
    },
  });

  // create platform roles
  await seedRoles(admin.person_id);

  // asign admin role to person admin email
  await prisma.personHasRole.create({
    data: {
      Role: { connect: { title: 'admin' } },
      Person: { connect: { email: admin.email } },
    },
  });
}

async function seedRoles(adminId: string) {
  await prisma.role.createMany({
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
