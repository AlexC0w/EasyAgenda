import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Limpiando base de datos...');
        await prisma.citaServicio.deleteMany();
        await prisma.cita.deleteMany();
        await prisma.businessSetting.deleteMany();
        await prisma.servicio.deleteMany();
        await prisma.barbero.deleteMany();
        await prisma.user.deleteMany();
        await prisma.business.deleteMany();

        console.log('Creando negocio Octane...');
        const business = await prisma.business.create({
            data: {
                id: 1,
                name: 'Octane Informatic Solutions',
                slug: 'octane',
                giro: 'Soluciones Informáticas',
            }
        });

        // passwordPlain existe en la DB pero no en el schema de Prisma — usar SQL raw
        // La contraseña real se pasa via SEED_PASSWORD env var por seguridad
        const plainPassword = process.env.SEED_PASSWORD || '';
        await prisma.$executeRaw`
            INSERT INTO User (username, passwordHash, passwordPlain, telefono, role, businessId, isMasterSuperAdmin, createdAt, updatedAt)
            VALUES ('Octane', '$2b$10$/1OiAhjjJl9pUj825aSqSulNzeazqnUdOnME5ypf8jwRjqTP6XFzS', ${plainPassword}, '6271310248', 'ADMIN', ${business.id}, false, NOW(), NOW())
        `;

        const admin = await prisma.user.findUnique({ where: { username: 'Octane' } });

        await prisma.barbero.create({
            data: {
                nombre: 'Ing. Alejandro Baca',
                horario_inicio: '09:00',
                horario_fin: '18:00',
                dias_laborales: '["monday","tuesday","wednesday","thursday","friday"]',
                duracion_cita: 30,
                userId: admin.id,
                businessId: business.id,
            }
        });

        await prisma.servicio.createMany({
            data: [
                { nombre: 'Demo de Software',        duracion: 30, precio: 0, businessId: business.id },
                { nombre: 'Consultoría Tecnológica', duracion: 60, precio: 0, businessId: business.id },
                { nombre: 'Revisión de Proyecto',    duracion: 45, precio: 0, businessId: business.id },
            ]
        });

        await prisma.businessSetting.createMany({
            data: [
                { key: 'businessName',    value: 'Octane Informatic Solutions', businessId: business.id },
                { key: 'businessPhone',   value: '6271310248',                  businessId: business.id },
                { key: 'businessAddress', value: 'México',                       businessId: business.id },
                { key: 'whatsappSender',  value: '6141977437',                  businessId: business.id },
            ]
        });

        console.log('✓ Base de datos lista.');
        console.log('  Agenda:  /octane');
        console.log('  Usuario: Octane');
        console.log('  Panel:   /admin');
    } catch (e) {
        console.error('Error en seed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
