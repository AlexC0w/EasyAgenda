import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERNAME = 'superadmin';
const PASSWORD = 'superadmin123';

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: USERNAME } });
  if (existing) {
    console.log(`El usuario "${USERNAME}" ya existe (role: ${existing.role})`);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      username: USERNAME,
      passwordHash,
      role: 'SUPERADMIN',
      isMasterSuperAdmin: true,
      businessId: 1,
    },
  });

  console.log(`✓ Superadmin creado: username="${user.username}" password="${PASSWORD}"`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
