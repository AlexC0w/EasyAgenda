import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Business
  const business = await prisma.business.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      id: 1,
      name: 'Agenda Octane Studio',
      slug: 'demo',
    },
  });
  console.log('Business created:', business);

  // Create Users
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { businessId: business.id },
    create: {
      username: 'admin',
      passwordHash: '$2b$10$rhFtvz6JVIqAQm7kyT.hneOdWfR6vZLgppqNEG8LLYHu19hHcxlu.',
      passwordPlain: 'admin123',
      telefono: '+52 555 010 9999',
      role: 'ADMIN',
      businessId: business.id,
    },
  });

  const carlos = await prisma.user.upsert({
    where: { username: 'carlos' },
    update: { businessId: business.id },
    create: {
      username: 'carlos',
      passwordHash: '$2b$10$M55guaZS2YlNyrFvrSAEKeKCV7yZvjkpbgQOUMuudxxkE9h1yebb6',
      passwordPlain: 'carlos2024',
      telefono: '+52 555 010 1111',
      role: 'BARBER',
      businessId: business.id,
    },
  });

  // Create Barberos
  await prisma.barbero.createMany({
    data: [
      {
        nombre: 'Octavio Cortez',
        horario_inicio: '09:00',
        horario_fin: '17:00',
        dias_laborales: '["monday","tuesday","wednesday","thursday","friday"]',
        duracion_cita: 30,
        userId: carlos.id, // We might need to fetch the ID if upsert returned it, but createMany doesn't support relations easily with mixed IDs. 
        // Better to use create or upsert individually if we need relations.
        businessId: business.id,
      },
      {
        nombre: 'Laura Fade',
        horario_inicio: '10:00',
        horario_fin: '18:00',
        dias_laborales: '["tuesday","wednesday","thursday","friday","saturday"]',
        duracion_cita: 45,
        businessId: business.id,
      },
    ],
    skipDuplicates: true, 
  });
  
  // Fix userId for Octavio since createMany doesn't handle it well if we don't know the ID.
  // Actually, let's just use raw SQL or individual creates. Individual creates are safer.
}

async function seed() {
    try {
        await prisma.business.deleteMany(); // Clear all data to be safe and clean
        // The cascade delete should handle the rest if configured, but Prisma doesn't cascade by default unless in schema.
        // We'll just delete in order.
        await prisma.cita.deleteMany();
        await prisma.businessSetting.deleteMany();
        await prisma.servicio.deleteMany();
        await prisma.barbero.deleteMany();
        await prisma.user.deleteMany();
        
        const business = await prisma.business.create({
            data: {
                id: 1,
                name: 'Agenda Octane Studio',
                slug: 'demo',
            }
        });

        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                passwordHash: '$2b$10$rhFtvz6JVIqAQm7kyT.hneOdWfR6vZLgppqNEG8LLYHu19hHcxlu.',
                passwordPlain: 'admin123',
                telefono: '+52 555 010 9999',
                role: 'ADMIN',
                businessId: business.id
            }
        });

        const carlos = await prisma.user.create({
            data: {
                username: 'carlos',
                passwordHash: '$2b$10$M55guaZS2YlNyrFvrSAEKeKCV7yZvjkpbgQOUMuudxxkE9h1yebb6',
                passwordPlain: 'carlos2024',
                telefono: '+52 555 010 1111',
                role: 'BARBER',
                businessId: business.id
            }
        });

        await prisma.barbero.create({
            data: {
                nombre: 'Octavio Cortez',
                horario_inicio: '09:00',
                horario_fin: '17:00',
                dias_laborales: '["monday","tuesday","wednesday","thursday","friday"]',
                duracion_cita: 30,
                userId: carlos.id,
                businessId: business.id
            }
        });

        await prisma.barbero.create({
            data: {
                nombre: 'Laura Fade',
                horario_inicio: '10:00',
                horario_fin: '18:00',
                dias_laborales: '["tuesday","wednesday","thursday","friday","saturday"]',
                duracion_cita: 45,
                businessId: business.id
            }
        });

        await prisma.servicio.createMany({
            data: [
                { nombre: 'Corte clásico', duracion: 30, precio: 15.00, businessId: business.id },
                { nombre: 'Afeitado premium', duracion: 45, precio: 25.00, businessId: business.id },
                { nombre: 'Diseño de barba', duracion: 30, precio: 20.00, businessId: business.id },
            ]
        });

        await prisma.businessSetting.createMany({
            data: [
                { key: 'businessName', value: 'Agenda Octane Studio', businessId: business.id },
                { key: 'businessPhone', value: '+52 555 010 7777', businessId: business.id },
                { key: 'businessAddress', value: 'Av. Revolución 123, CDMX', businessId: business.id },
                { key: 'whatsappSender', value: '+52 555 010 8888', businessId: business.id },
            ]
        });

        console.log('Seeding completed.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
