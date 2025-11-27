import { Router } from 'express';
import { availabilityQueryValidator } from '../validators/appointmentValidator.js';
import validateRequest from '../middleware/validateRequest.js';
import { getAvailability } from '../services/availabilityService.js';
import { resolveTenant } from '../middleware/tenant.js';
import prisma from '../lib/prisma.js';

const router = Router({ mergeParams: true });

router.get(
  '/:barberoId',
  resolveTenant,
  availabilityQueryValidator,
  validateRequest,
  async (req, res, next) => {
    try {
      if (!req.businessId) {
          return res.status(400).json({ message: 'Se requiere especificar el negocio.' });
      }

      const { fecha, servicioId, duration } = req.query;
      const barberoId = Number(req.params.barberoId);
      
      // Verify barbero belongs to business
      const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
      if (!barbero || barbero.businessId !== req.businessId) {
          return res.status(404).json({ message: 'Barbero no encontrado.' });
      }

      const availability = await getAvailability(barberoId, fecha, {
        serviceId: servicioId ? Number(servicioId) : undefined,
        duration: duration ? Number(duration) : undefined,
      });
      res.json({ fecha, barberoId, disponibilidad: availability });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
