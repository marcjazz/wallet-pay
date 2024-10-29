import { PrismaClient, SupportedLocalCurrency } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { generateAccountNumber } from '../../helpers/otp-generator';
const prisma = new PrismaClient();

async function main() {
  const password = hashSync(
    process.env.ADMIN_PASSWORD || 'password237!',
    genSaltSync(Number(process.env.SALT_ROUNDS))
  );

  const admin = await prisma.person.create({
    data: {
      email: 'admin@xafpay.com',
      birthdate: new Date(),
      first_name: 'XafPay',
      last_name: 'Admin',
      gender: 'MALE',
      password,
      phone_number: '+1 (703) 899-5276',
      username: process.env.ADMIN_PASSWORD || 'xafpay237!',
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

  await prisma.role.createMany({
    data: [
      {
        title: 'client',
        created_by: admin.person_id,
      },
      {
        title: 'admin',
        created_by: admin.person_id,
      },
    ],
  });
  await prisma.personHasRole.create({
    data: {
      Role: { connect: { title: 'admin' } },
      Person: { connect: { email: admin.email } },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
