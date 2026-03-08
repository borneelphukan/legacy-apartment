import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // @ts-ignore
    if (!global.prisma) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      // @ts-ignore
      global.prisma = new PrismaClient({ adapter });
    }
    // @ts-ignore
    prisma = global.prisma;
  }
}

export default prisma!;
