import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { barbero: true },
    });
    res.json(
      users.map((user) => ({
        id: user.id,
        username: user.username,
        telefono: user.telefono,
        role: user.role,
        password: user.passwordPlain,
        createdAt: user.createdAt,
        barberoId: user.barbero?.id ?? null,
        barberoNombre: user.barbero?.nombre ?? null,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password, telefono, role = 'BARBER' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hash,
        passwordPlain: password,
        telefono: telefono || null,
        role,
      },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      telefono: user.telefono,
      role: user.role,
      password: user.passwordPlain,
      barberoId: null,
    });
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
    const { password, telefono, role } = req.body;

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

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: { barbero: true },
    });

    res.json({
      id: user.id,
      username: user.username,
      telefono: user.telefono,
      role: user.role,
      password: user.passwordPlain,
      barberoId: user.barbero?.id ?? null,
      barberoNombre: user.barbero?.nombre ?? null,
    });
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
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    next(error);
  }
});

export default router;
