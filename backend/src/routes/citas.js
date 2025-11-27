import { Router } from 'express';
import prisma from '../lib/prisma.js';
import sendWhatsApp from '../lib/sendWhatsApp.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createAppointmentValidator,
  updateAppointmentValidator,
} from '../validators/appointmentValidator.js';
import { getAvailability, isSlotAvailable } from '../services/availabilityService.js';
import { authenticate } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const where = {
        businessId: req.user.businessId
    };
    if (req.user.role === 'BARBER') {
      if (!req.user.barberoId) {
        return res.status(403).json({ message: 'Tu cuenta no está vinculada a un barbero.' });
      }
      where.barbero_id = req.user.barberoId;
    }

    const citas = await prisma.cita.findMany({
      where,
      include: { barbero: true, servicio: true },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get('/:barberoId', authenticate, async (req, res, next) => {
  try {
    const barberoId = Number(req.params.barberoId);
    if (req.user.role === 'BARBER' && req.user.barberoId !== barberoId) {
      return res.status(403).json({ message: 'No autorizado a ver las citas de otros barberos.' });
    }

    // Verify barbero belongs to business
    const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
    if (!barbero || barbero.businessId !== req.user.businessId) {
        return res.status(404).json({ message: 'Barbero no encontrado.' });
    }

    const citas = await prisma.cita.findMany({
      where: { barbero_id: barberoId, businessId: req.user.businessId },
      include: { barbero: true, servicio: true },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.post('/', resolveTenant, createAppointmentValidator, validateRequest, async (req, res, next) => {
  console.log('--- [Backend Debug] POST /citas HIT ---');
  try {
    let { barberoId, servicioId, cliente, telefono, fecha, hora } = req.body;
    
    // Sanitize phone number
    telefono = telefono.replace(/\D/g, '');
    // Fallback: If number is 10 digits (Mexico local), add country code 52
    if (telefono.length === 10) {
        telefono = '52' + telefono;
    }
    
    if (!req.businessId) {
        return res.status(400).json({ message: 'Se requiere especificar el negocio.' });
    }

    const [barbero, servicio] = await Promise.all([
      prisma.barbero.findUnique({ where: { id: Number(barberoId) } }),
      prisma.servicio.findUnique({ where: { id: Number(servicioId) } }),
    ]);

    if (!barbero || barbero.businessId !== req.businessId) {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }
    if (!servicio || servicio.businessId !== req.businessId) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const disponible = await isSlotAvailable(barbero.id, fecha, hora, servicio.duracion);
    if (!disponible) {
      const disponibilidad = await getAvailability(barbero.id, fecha, {
        duration: servicio.duracion,
      });
      return res.status(409).json({
        message: 'Horario no disponible',
        disponibilidad,
      });
    }

    const cita = await prisma.cita.create({
      data: {
        barbero: { connect: { id: barbero.id } },
        servicio: { connect: { id: servicio.id } },
        business: { connect: { id: req.businessId } },
        cliente,
        telefono,
        fecha: new Date(`${fecha}T00:00:00`),
        hora,
        estado: 'confirmada',
      },
      include: { barbero: true, servicio: true },
    });

    const settings = await prisma.businessSetting.findMany({
      where: { businessId: req.businessId }
    });
    const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

    const message = `¡Hola ${cliente}! Tu cita con ${cita.barbero.nombre} para ${cita.servicio.nombre} está confirmada el ${fecha} a las ${hora}.`;

    const whatsappResult = await sendWhatsApp(telefono, message, settingsMap);
    
    // If provider is not configured, flag it for the admin
    if (whatsappResult?.errorType === 'PROVIDER_NOT_CONFIGURED') {
      await prisma.businessSetting.upsert({
        where: {
          businessId_key: {
            businessId: req.businessId,
            key: 'whatsapp_pending_setup'
          }
        },
        update: { value: 'true' },
        create: {
          businessId: req.businessId,
          key: 'whatsapp_pending_setup',
          value: 'true'
        }
      });
    }

    const whatsappError =
      whatsappResult?.success === false
        ? whatsappResult.error || 'No se pudo enviar el mensaje de WhatsApp.'
        : null;

    res.status(201).json({
      ...cita,
      whatsappEnviado: !whatsappError,
      whatsappError,
      whatsappNumber: whatsappResult?.number ?? telefono,
      whatsappResponse: whatsappResult?.response ?? null,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, updateAppointmentValidator, validateRequest, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, fecha, hora } = req.body;

    const cita = await prisma.cita.findUnique({ where: { id: Number(id) }, include: { servicio: true } });
    if (!cita || cita.businessId !== req.user.businessId) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (req.user.role === 'BARBER' && req.user.barberoId !== cita.barbero_id) {
      return res.status(403).json({ message: 'No autorizado para modificar esta cita.' });
    }

    if ((fecha || hora) && !(fecha && hora)) {
      return res.status(400).json({ message: 'Debe enviar fecha y hora juntas para reprogramar' });
    }

    if (fecha && hora) {
      const disponible = await isSlotAvailable(cita.barbero_id, fecha, hora, cita.servicio.duracion);
      if (!disponible) {
        const disponibilidad = await getAvailability(cita.barbero_id, fecha, {
          duration: cita.servicio.duracion,
        });
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
