import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const password = hashSync(
    'password',
    genSaltSync(Number(process.env.SALT_ROUNDS))
  );
  const alice = await prisma.person.create({
    data: {
      email: 'marco@xafpay.com',
      birthdate: new Date(),
      first_name: 'Marco',
      last_name: 'Kuidja',
      gender: 'MALE',
      password,
      phone_number: '+1 643 012 75',
      username: 'xafpay_alic1',
    },
  });

  const clientSubdomain = process.env.CLIENT_SUBDOMAIN;
  const adminSubdomain = process.env.CLIENT_SUBDOMAIN;
  await prisma.role.createMany({
    data: [
      {
        title: 'client',
        subdomain: clientSubdomain,
        created_by: alice.person_id,
      },
      {
        title: 'admin',
        subdomain: adminSubdomain,
        created_by: alice.person_id,
      },
    ],
  });

  await prisma.personHasRole.create({
    data: {
      Role: {
        connect: {
          title: 'admin',
          // subdomain: 'admin.xafpay.com'
        },
      },
      Person: { connect: { email: alice.email } },
    },
  });

  await prisma.personHasRole.create({
    data: {
      Role: {
        connect: {
          title: 'client',
          // subdomain: 'app.xafpay.com'
        },
      },
      Person: { connect: { email: alice.email } },
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
