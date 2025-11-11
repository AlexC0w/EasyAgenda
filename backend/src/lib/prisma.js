import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hasUserModel = typeof prisma.user !== 'undefined';

if (!hasUserModel) {
  console.error(
    '\n[Prisma] El cliente generado no incluye el modelo `User`. Ejecuta `npm install` o `npx prisma generate` para regenerar el cliente a partir del schema actualizado.\n'
  );
  throw new Error('El cliente de Prisma está desactualizado. Ejecuta `npx prisma generate`.');
}

export default prisma;
