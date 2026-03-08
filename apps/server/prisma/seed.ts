import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  const hashedPassword = await bcrypt.hash('dipak5969', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'phukandipak@gmail.com' },
    update: {},
    create: {
      id: 1,
      firstName: 'Dipak',
      lastName: 'Phukan',
      email: 'phukandipak@gmail.com',
      password: hashedPassword,
    },
  });

  console.log('Seeded User:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
