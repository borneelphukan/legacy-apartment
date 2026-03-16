import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const members = await prisma.committeeMember.findMany();
  const seen = new Set();
  for (const m of members) {
    const key = m.name.toLowerCase();
    if (seen.has(key)) {
      console.log(`Deleting duplicate: ${m.name} (ID: ${m.id})`);
      await prisma.committeeMember.delete({ where: { id: m.id } });
    } else {
      seen.add(key);
    }
  }
}
clean().then(() => { console.log('Done!'); process.exit(0); });
