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
      include: { 
        barbero: true, 
        servicio: true,
        servicios: { include: { servicio: true } }
      },
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
      include: { 
        barbero: true, 
        servicio: true,
        servicios: { include: { servicio: true } }
      },
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
    let { barberoId, servicioId, serviciosIds, cliente, telefono, fecha, hora } = req.body;
    
    // Sanitize phone number
    telefono = telefono.replace(/\D/g, '');
    // Fallback: If number is 10 digits (Mexico local), add country code 52
    if (telefono.length === 10) {
        telefono = '52' + telefono;
    }
    
    if (!req.businessId) {
        return res.status(400).json({ message: 'Se requiere especificar el negocio.' });
    }

    // Determine services to book
    let serviceIdsToBook = [];
    if (serviciosIds && Array.isArray(serviciosIds) && serviciosIds.length > 0) {
        serviceIdsToBook = serviciosIds.map(id => Number(id));
    } else {
        serviceIdsToBook = [Number(servicioId)];
    }

    const [barbero, services] = await Promise.all([
      prisma.barbero.findUnique({ 
        where: { id: Number(barberoId) },
        include: { user: true }
      }),
      prisma.servicio.findMany({ 
        where: { id: { in: serviceIdsToBook } } 
      }),
    ]);

    if (!barbero || barbero.businessId !== req.businessId) {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }
    
    if (services.length !== serviceIdsToBook.length) {
      return res.status(404).json({ message: 'Uno o más servicios no encontrados' });
    }

    // Verify all services belong to business
    const invalidServices = services.filter(s => s.businessId !== req.businessId);
    if (invalidServices.length > 0) {
        return res.status(403).json({ message: 'Servicios no pertenecen al negocio' });
    }

    // Calculate total duration
    const totalDuration = services.reduce((sum, s) => sum + s.duracion, 0);
    const serviceNames = services.map(s => s.nombre).join(' + ');

    const disponible = await isSlotAvailable(barbero.id, fecha, hora, totalDuration);
    if (!disponible) {
      const disponibilidad = await getAvailability(barbero.id, fecha, {
        duration: totalDuration,
      });
      return res.status(409).json({
        message: 'Horario no disponible',
        disponibilidad,
      });
    }

    const cita = await prisma.cita.create({
      data: {
        barbero: { connect: { id: barbero.id } },
        servicio: { connect: { id: services[0].id } }, // Primary service (first one)
        business: { connect: { id: req.businessId } },
        cliente,
        telefono,
        fecha: new Date(`${fecha}T00:00:00`),
        hora,
        estado: 'pendiente',
        duracionTotal: totalDuration,
        servicios: {
            create: services.map(s => ({ servicioId: s.id }))
        }
      },
      include: { barbero: true, servicio: true, servicios: { include: { servicio: true } } },
    });

    const settings = await prisma.businessSetting.findMany({
      where: { businessId: req.businessId }
    });
    const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmLink = `${frontendUrl}/confirmar-cita/${cita.id}`;
    
    // 1. Send "Request Sent" message to Client
    const clientMessage = `¡Hola ${cliente}! Tu solicitud de cita con ${cita.barbero.nombre} para ${serviceNames} el ${fecha} a las ${hora} ha sido ENVIADA. Espera la confirmación del profesional.`;
    const whatsappResult = await sendWhatsApp(telefono, clientMessage, settingsMap);
    
    // 2. Send Confirmation Link to Barber (if phone exists)
    if (barbero.user && barbero.user.telefono) {
        let barberPhone = barbero.user.telefono.replace(/\D/g, '');
        if (barberPhone.length === 10) {
            barberPhone = '52' + barberPhone;
        }
        
        const barberMessage = `📅 Nueva Solicitud de Cita\n\nCliente: ${cliente}\nServicios: ${serviceNames}\nFecha: ${fecha}\nHora: ${hora}\nDuración: ${totalDuration} min\n\nPara confirmar esta cita, entra aquí: ${confirmLink}`;
        
        // We don't block the response if this fails, just log it
        sendWhatsApp(barberPhone, barberMessage, settingsMap).catch(err => 
            console.error('Error sending WhatsApp to barber:', err)
        );
    }

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
        ? whatsappResult.error || 'No se pudo enviar el mensaje de WhatsApp al cliente.'
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

router.get('/:id/public', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cita = await prisma.cita.findUnique({
      where: { id: Number(id) },
      include: { 
        barbero: true, 
        servicio: true, 
        business: true,
        servicios: { include: { servicio: true } }
      }
    });

    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(cita);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/confirm', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cita = await prisma.cita.findUnique({ 
        where: { id: Number(id) },
        include: { barbero: true, servicio: true, business: true }
    });

    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (cita.estado === 'confirmada') {
      return res.json({ message: 'La cita ya estaba confirmada.', cita });
    }

    const updated = await prisma.cita.update({
      where: { id: Number(id) },
      data: { estado: 'confirmada' },
      include: { 
        barbero: true, 
        servicio: true, 
        business: true,
        servicios: { include: { servicio: true } }
      }
    });

    // Notify Client about confirmation
    try {
        const settings = await prisma.businessSetting.findMany({
            where: { businessId: cita.businessId }
        });
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        
        const fechaFormatted = new Date(cita.fecha).toLocaleDateString('es-MX', { dateStyle: 'long', timeZone: 'UTC' });
        
        let serviceNames = cita.servicio.nombre;
        if (updated.servicios && updated.servicios.length > 0) {
            serviceNames = updated.servicios.map(s => s.servicio.nombre).join(' + ');
        }

        const clientMessage = `✅ ¡Tu cita ha sido CONFIRMADA!\n\nProfesional: ${cita.barbero.nombre}\nServicios: ${serviceNames}\nFecha: ${fechaFormatted}\nHora: ${cita.hora}\n\n¡Te esperamos!`;
        
        sendWhatsApp(cita.telefono, clientMessage, settingsMap).catch(err =>
            console.error('Error sending confirmation to client:', err)
        );
    } catch (err) {
        console.error('Error preparing confirmation message:', err);
    }

    res.json({ message: 'Cita confirmada exitosamente', cita: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cita = await prisma.cita.findUnique({ 
        where: { id: Number(id) },
        include: { barbero: true, servicio: true, business: true }
    });

    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (cita.estado === 'cancelada') {
      return res.json({ message: 'La cita ya estaba cancelada.', cita });
    }

    const updated = await prisma.cita.update({
      where: { id: Number(id) },
      data: { estado: 'cancelada' },
      include: { 
        barbero: true, 
        servicio: true, 
        business: true,
        servicios: { include: { servicio: true } }
      }
    });

    // Notify Client about cancellation
    try {
        const settings = await prisma.businessSetting.findMany({
            where: { businessId: cita.businessId }
        });
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        
        const fechaFormatted = new Date(cita.fecha).toLocaleDateString('es-MX', { dateStyle: 'long', timeZone: 'UTC' });

        let serviceNames = cita.servicio.nombre;
        if (updated.servicios && updated.servicios.length > 0) {
            serviceNames = updated.servicios.map(s => s.servicio.nombre).join(' + ');
        }

        const clientMessage = `❌ Tu cita ha sido CANCELADA.\n\nProfesional: ${cita.barbero.nombre}\nServicios: ${serviceNames}\nFecha: ${fechaFormatted}\nHora: ${cita.hora}\n\nDisculpa las molestias.`;
        
        sendWhatsApp(cita.telefono, clientMessage, settingsMap).catch(err =>
            console.error('Error sending cancellation to client:', err)
        );
    } catch (err) {
        console.error('Error preparing cancellation message:', err);
    }

    res.json({ message: 'Cita cancelada exitosamente', cita: updated });
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
