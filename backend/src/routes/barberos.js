import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const barberos = await prisma.barbero.findMany({ orderBy: { nombre: 'asc' } });
    res.json(barberos.map((barbero) => ({
      ...barbero,
      dias_laborales: JSON.parse(barbero.dias_laborales || '[]'),
    })));
  } catch (error) {
    next(error);
  }
});

export default router;
