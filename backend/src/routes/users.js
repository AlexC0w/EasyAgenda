import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const allowedDays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

const serializeBarbero = (barbero) => {
  if (!barbero) return null;
  return {
    id: barbero.id,
    nombre: barbero.nombre,
    horario_inicio: barbero.horario_inicio,
    horario_fin: barbero.horario_fin,
    duracion_cita: barbero.duracion_cita,
    dias_laborales: JSON.parse(barbero.dias_laborales || '[]'),
    userId: barbero.userId,
  };
};

const serializeUser = (user) => {
  const barberoProfile = serializeBarbero(user.barbero);
  return {
    id: user.id,
    username: user.username,
    telefono: user.telefono,
    role: user.role,
    password: user.passwordPlain,
    createdAt: user.createdAt,
    barberoId: barberoProfile?.id ?? null,
    barberoNombre: barberoProfile?.nombre ?? null,
    barberoProfile,
  };
};

const buildBarberoData = (profile) => {
  if (!profile) {
    throw new Error('Debe proporcionar la información del perfil del barbero.');
  }

  const nombre = profile.nombre?.trim();
  const horarioInicio = profile.horario_inicio || profile.horarioInicio;
  const horarioFin = profile.horario_fin || profile.horarioFin;
  const duracion = Number(profile.duracion_cita ?? profile.duracionCita);
  const diasInput = profile.dias_laborales || profile.diasLaborales || [];
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

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { barbero: true },
    });
    res.json(users.map(serializeUser));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password, telefono, role = 'BARBER', barberoProfile } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    let barberoData = null;
    if (role === 'BARBER') {
      try {
        barberoData = buildBarberoData(barberoProfile);
      } catch (validationError) {
        return res.status(400).json({ message: validationError.message });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hash,
        passwordPlain: password,
        telefono: telefono || null,
        role,
        ...(barberoData
          ? {
              barbero: {
                create: barberoData,
              },
            }
          : {}),
      },
      include: { barbero: true },
    });

    res.status(201).json(serializeUser(user));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });
    }
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, telefono, role, barberoProfile } = req.body;

    const userId = Number(id);
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: { barbero: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const data = {};
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
      data.passwordPlain = password;
    }
    if (telefono !== undefined) {
      data.telefono = telefono;
    }
    if (role) {
      data.role = role;
    }

    let barberoData = null;
    if (barberoProfile !== undefined) {
      try {
        barberoData = buildBarberoData(barberoProfile);
      } catch (validationError) {
        return res.status(400).json({ message: validationError.message });
      }
    }

    if (!barberoData && role === 'BARBER' && !existing.barbero) {
      return res
        .status(400)
        .json({ message: 'Debes proporcionar la información del perfil del barbero.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...data,
          ...(barberoData
            ? existing.barbero
              ? {
                  barbero: {
                    update: barberoData,
                  },
                }
              : {
                  barbero: {
                    create: barberoData,
                  },
                }
            : {}),
        },
      });

      if (!barberoData && role && role !== 'BARBER' && existing.barbero) {
        await tx.barbero.update({
          where: { id: existing.barbero.id },
          data: { userId: null },
        });
      }
    });

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      include: { barbero: true },
    });

    res.json(serializeUser(updated));
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: { barbero: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await prisma.$transaction(async (tx) => {
      if (existing.barbero) {
        await tx.barbero.update({
          where: { id: existing.barbero.id },
          data: { userId: null },
        });
      }
      await tx.user.delete({ where: { id: userId } });
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
