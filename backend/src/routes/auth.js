import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const barbero = await prisma.barbero.findFirst({ where: { userId: user.id } });
    const token = signToken({ sub: user.id, role: user.role, username: user.username });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        telefono: user.telefono,
        password: user.passwordPlain,
        barberoId: barbero?.id ?? null,
        barberoNombre: barbero?.nombre ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const barbero = await prisma.barbero.findFirst({ where: { userId: user.id } });
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      telefono: user.telefono,
      password: user.passwordPlain,
      barberoId: barbero?.id ?? null,
      barberoNombre: barbero?.nombre ?? null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
