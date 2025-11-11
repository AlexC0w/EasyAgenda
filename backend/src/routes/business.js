import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { invalidateWhatsAppConfig } from '../lib/whatsappConfig.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.businessSetting.findMany({ orderBy: { key: 'asc' } });
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
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    invalidateWhatsAppConfig();
    res.json(updates);
  } catch (error) {
    next(error);
  }
});

export default router;
