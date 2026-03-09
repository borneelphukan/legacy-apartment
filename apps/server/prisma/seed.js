"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
//# sourceMappingURL=seed.js.map