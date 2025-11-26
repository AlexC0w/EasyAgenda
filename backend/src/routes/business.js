import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/giros', async (req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      select: { giro: true },
      distinct: ['giro'],
    });
    const giros = businesses.map((b) => b.giro).filter(Boolean);
    res.json(giros);
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.businessSetting.findMany({ 
        where: { businessId: req.user.businessId },
        orderBy: { key: 'asc' } 
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const entries = Object.entries(req.body || {});
    const updates = await Promise.all(
      entries.map(([key, value]) =>
        prisma.businessSetting.upsert({
          where: { 
            businessId_key: {
                businessId: req.user.businessId,
                key
            }
          },
          update: { value: String(value) },
          create: { 
            key, 
            value: String(value),
            businessId: req.user.businessId
          },
        })
      )
    );
    res.json(updates);
  } catch (error) {
    next(error);
  }
});

export default router;
