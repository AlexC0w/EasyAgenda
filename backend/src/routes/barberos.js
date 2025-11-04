import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const allowedDays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

const serializeBarbero = (barbero) => ({
  id: barbero.id,
  nombre: barbero.nombre,
  horario_inicio: barbero.horario_inicio,
  horario_fin: barbero.horario_fin,
  duracion_cita: barbero.duracion_cita,
  dias_laborales: JSON.parse(barbero.dias_laborales || '[]'),
  userId: barbero.userId,
  createdAt: barbero.createdAt,
  updatedAt: barbero.updatedAt,
});

const buildPayload = (body) => {
  const nombre = body.nombre?.trim();
  const horarioInicio = body.horario_inicio || body.horarioInicio;
  const horarioFin = body.horario_fin || body.horarioFin;
  const duracion = Number(body.duracion_cita ?? body.duracionCita);
  const diasInput = body.dias_laborales || body.diasLaborales || [];
  const dias = Array.isArray(diasInput)
    ? Array.from(
        new Set(
          diasInput
            .map((day) => String(day).toLowerCase())
            .filter((day) => allowedDays.has(day))
        )
      )
    : [];

  if (!nombre) {
    throw new Error('El nombre del barbero es obligatorio.');
  }
  if (!horarioInicio || !horarioFin) {
    throw new Error('Debes indicar el horario de servicio.');
  }
  if (!dias.length) {
    throw new Error('Selecciona al menos un día laboral.');
  }
  if (!Number.isFinite(duracion) || duracion <= 0) {
    throw new Error('La duración base de la cita debe ser un número mayor a 0.');
  }

  return {
    nombre,
    horario_inicio: horarioInicio,
    horario_fin: horarioFin,
    duracion_cita: Math.round(duracion),
    dias_laborales: JSON.stringify(dias),
  };
};

router.get('/', async (req, res, next) => {
  try {
    const barberos = await prisma.barbero.findMany({ orderBy: { nombre: 'asc' } });
    res.json(barberos.map(serializeBarbero));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    const barbero = await prisma.barbero.create({
      data: {
        ...payload,
        userId: req.body.userId ? Number(req.body.userId) : null,
      },
    });
    res.status(201).json(serializeBarbero(barbero));
  } catch (error) {
    if (error.message?.includes('obligatorio') || error.message?.includes('Debes')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.put('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = buildPayload(req.body);
    const barbero = await prisma.barbero.update({
      where: { id: Number(id) },
      data: {
        ...payload,
        userId: req.body.userId === undefined ? undefined : req.body.userId ? Number(req.body.userId) : null,
      },
    });
    res.json(serializeBarbero(barbero));
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Barbero no encontrado.' });
    }
    if (error.message?.includes('obligatorio') || error.message?.includes('Debes')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.barbero.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Barbero no encontrado.' });
    }
    next(error);
  }
});

export default router;
