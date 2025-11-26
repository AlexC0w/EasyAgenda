import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Fixing data for User 4 and Barber 3...');
  
  // Update User 4 to Business 2
  const user = await prisma.user.update({
    where: { id: 4 },
    data: { businessId: 2 }
  });
  console.log('Updated User 4:', user);

  // Update Barber 3 to Business 2
  const barber = await prisma.barbero.update({
    where: { id: 3 },
    data: { businessId: 2 }
  });
  console.log('Updated Barber 3:', barber);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
