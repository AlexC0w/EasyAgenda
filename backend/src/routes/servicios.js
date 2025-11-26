import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';

const router = Router();

const serializeService = (service) => ({
  id: service.id,
  nombre: service.nombre,
  duracion: service.duracion,
  precio: service.precio?.toString?.() ?? String(service.precio),
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
});

const parseServicePayload = (body) => {
  const nombre = body.nombre?.trim();
  const duracion = Number(body.duracion);
  const precioValue = body.precio;
  const precio = typeof precioValue === 'number' ? precioValue : Number.parseFloat(precioValue);

  if (!nombre) {
    throw new Error('El nombre del servicio es obligatorio.');
  }
  if (!Number.isFinite(duracion) || duracion <= 0) {
    throw new Error('La duración debe ser un número mayor a 0.');
  }
  if (!Number.isFinite(precio) || precio < 0) {
    throw new Error('El precio debe ser un número válido.');
  }

  return {
    nombre,
    duracion: Math.round(duracion),
    precio: precio.toFixed(2),
  };
};

router.get('/', optionalAuthenticate, resolveTenant, async (req, res, next) => {
  try {
    if (!req.businessId) {
        return res.status(400).json({ message: 'Se requiere especificar el negocio (slug).' });
    }
    const servicios = await prisma.servicio.findMany({ 
        where: { businessId: req.businessId },
        orderBy: { nombre: 'asc' } 
    });
    res.json(servicios.map(serializeService));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const payload = parseServicePayload(req.body);
    const servicio = await prisma.servicio.create({ 
        data: {
            ...payload,
            businessId: req.user.businessId
        } 
    });
    res.status(201).json(serializeService(servicio));
  } catch (error) {
    if (error.message?.includes('obligatorio') || error.message?.includes('número')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.put('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = parseServicePayload(req.body);
    
    // Check ownership
    const existing = await prisma.servicio.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.businessId !== req.user.businessId) {
        return res.status(404).json({ message: 'Servicio no encontrado.' });
    }

    const servicio = await prisma.servicio.update({ where: { id: Number(id) }, data: payload });
    res.json(serializeService(servicio));
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Servicio no encontrado.' });
    }
    if (error.message?.includes('obligatorio') || error.message?.includes('número')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const existing = await prisma.servicio.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.businessId !== req.user.businessId) {
        return res.status(404).json({ message: 'Servicio no encontrado.' });
    }

    await prisma.servicio.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Servicio no encontrado.' });
    }
    next(error);
  }
});

export default router;
