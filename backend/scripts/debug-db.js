import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Businesses ---');
  const businesses = await prisma.business.findMany();
  console.log(JSON.stringify(businesses, null, 2));

  console.log('\n--- Users ---');
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, businessId: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- Business Settings ---');
  const settings = await prisma.businessSetting.findMany({
    orderBy: { businessId: 'asc' }
  });
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
