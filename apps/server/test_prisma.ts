import { PrismaClient } from '@prisma/client';
const p1 = new PrismaClient({ accelerateUrl: "yes" });
const p2 = new PrismaClient({ url: "yes" });
const p3 = new PrismaClient({ adapter: {} as any });
