import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const serializeUser = (user) => {
  const barberoProfile = user.barbero
    ? {
        id: user.barbero.id,
        nombre: user.barbero.nombre,
        horario_inicio: user.barbero.horario_inicio,
        horario_fin: user.barbero.horario_fin,
        duracion_cita: user.barbero.duracion_cita,
        dias_laborales: JSON.parse(user.barbero.dias_laborales || '[]'),
      }
    : null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    telefono: user.telefono,
    password: user.passwordPlain,
    barberoId: barberoProfile?.id ?? null,
    barberoNombre: barberoProfile?.nombre ?? null,
    barberoProfile,
  };
};

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { username }, include: { barbero: true } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signToken({ sub: user.id, role: user.role, username: user.username });

    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { barbero: true } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

export default router;
