import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/business/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const business = await prisma.business.findUnique({
      where: { slug },
      include: { settings: true },
    });

    if (!business) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    // Extract public settings
    const settingsMap = business.settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json({
      name: business.name,
      giro: business.giro,
      slug: business.slug,
      settings: settingsMap,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
