import { Router } from 'express';
import { availabilityQueryValidator } from '../validators/appointmentValidator.js';
import validateRequest from '../middleware/validateRequest.js';
import { getAvailability } from '../services/availabilityService.js';

const router = Router({ mergeParams: true });

router.get(
  '/:barberoId',
  availabilityQueryValidator,
  validateRequest,
  async (req, res, next) => {
    try {
      const { fecha } = req.query;
      const barberoId = Number(req.params.barberoId);
      const availability = await getAvailability(barberoId, fecha);
      res.json({ fecha, barberoId, disponibilidad: availability });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
