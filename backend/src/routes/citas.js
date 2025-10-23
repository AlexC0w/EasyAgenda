import { Router } from 'express';
import prisma from '../lib/prisma.js';
import sendWhatsApp from '../lib/sendWhatsApp.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createAppointmentValidator,
  updateAppointmentValidator,
} from '../validators/appointmentValidator.js';
import { getAvailability, isSlotAvailable } from '../services/availabilityService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const citas = await prisma.cita.findMany({
      include: { barbero: true, servicio: true },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get('/:barberoId', async (req, res, next) => {
  try {
    const barberoId = Number(req.params.barberoId);
    const citas = await prisma.cita.findMany({
      where: { barbero_id: barberoId },
      include: { barbero: true, servicio: true },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.post('/', createAppointmentValidator, validateRequest, async (req, res, next) => {
  try {
    const { barberoId, servicioId, cliente, telefono, fecha, hora } = req.body;

    const [barbero, servicio] = await Promise.all([
      prisma.barbero.findUnique({ where: { id: Number(barberoId) } }),
      prisma.servicio.findUnique({ where: { id: Number(servicioId) } }),
    ]);

    if (!barbero) {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const disponible = await isSlotAvailable(barbero.id, fecha, hora, servicio.duracion);
    if (!disponible) {
      const disponibilidad = await getAvailability(barbero.id, fecha);
      return res.status(409).json({
        message: 'Horario no disponible',
        disponibilidad,
      });
    }

    const cita = await prisma.cita.create({
      data: {
        barbero: { connect: { id: barbero.id } },
        servicio: { connect: { id: servicio.id } },
        cliente,
        telefono,
        fecha: new Date(`${fecha}T00:00:00`),
        hora,
        estado: 'confirmada',
      },
      include: { barbero: true, servicio: true },
    });

    const message = `¡Hola ${cliente}! Tu cita con ${cita.barbero.nombre} para ${cita.servicio.nombre} está confirmada el ${fecha} a las ${hora}.`;
    await sendWhatsApp(telefono, message);

    res.status(201).json(cita);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', updateAppointmentValidator, validateRequest, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, fecha, hora } = req.body;

    const cita = await prisma.cita.findUnique({ where: { id: Number(id) }, include: { servicio: true } });
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if ((fecha || hora) && !(fecha && hora)) {
      return res.status(400).json({ message: 'Debe enviar fecha y hora juntas para reprogramar' });
    }

    if (fecha && hora) {
      const disponible = await isSlotAvailable(cita.barbero_id, fecha, hora, cita.servicio.duracion);
      if (!disponible) {
        const disponibilidad = await getAvailability(cita.barbero_id, fecha);
        return res.status(409).json({
          message: 'Horario no disponible',
          disponibilidad,
        });
      }
    }

    const updated = await prisma.cita.update({
      where: { id: Number(id) },
      data: {
        estado: estado || cita.estado,
        fecha: fecha ? new Date(`${fecha}T00:00:00`) : cita.fecha,
        hora: hora || cita.hora,
        recordatorioEnviado: false,
      },
      include: { barbero: true, servicio: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
