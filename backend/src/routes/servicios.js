import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const servicios = await prisma.servicio.findMany({ orderBy: { nombre: 'asc' } });
    res.json(servicios);
  } catch (error) {
    next(error);
  }
});

export default router;
