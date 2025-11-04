import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const runtimeModel = prisma._runtimeDataModel ?? {};
const models = runtimeModel.models ?? {};

const hasUserModel = typeof prisma.user !== 'undefined';
const servicioFields = models.Servicio?.fields ?? [];
const hasDescripcionField = servicioFields.some((field) => field?.name === 'descripcion');

if (!hasUserModel) {
  console.error(
    '\n[Prisma] El cliente generado no incluye el modelo `User`. Ejecuta `npm install` o `npx prisma generate` para regenerar el cliente a partir del schema actualizado.\n'
  );
  throw new Error('El cliente de Prisma está desactualizado. Ejecuta `npx prisma generate`.');
}

if (!hasDescripcionField) {
  console.error(
    '\n[Prisma] El cliente generado no contiene el campo `Servicio.descripcion`. Ejecuta `npm --prefix backend run prisma:generate` para sincronizar el cliente con el schema actual.\n'
  );
  throw new Error('El cliente de Prisma está desactualizado. Ejecuta `npm --prefix backend run prisma:generate`.');
}

export default prisma;
