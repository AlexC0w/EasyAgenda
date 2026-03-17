import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const serializeUser = (user) => {
  const barberoProfile = user.barbero
    ? {
        id: user.barbero.id,
        nombre: user.barbero.nombre,
        horario_inicio: user.barbero.horario_inicio,
        horario_fin: user.barbero.horario_fin,
        duracion_cita: user.barbero.duracion_cita,
        dias_laborales: JSON.parse(user.barbero.dias_laborales || '[]'),
      }
    : null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    telefono: user.telefono,
    businessId: user.businessId,
    businessSlug: user.business?.slug,
    businessGiro: user.business?.giro,
    subscriptionStatus: user.business?.subscriptionStatus,
    barberoId: barberoProfile?.id ?? null,
    barberoNombre: barberoProfile?.nombre ?? null,
    barberoProfile,
  };
};

router.post('/register-business', async (req, res, next) => {
  try {
    const { businessName, slug, username, password, telefono, giro } = req.body;

    if (!businessName || !slug || !username || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const existingSlug = await prisma.business.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(409).json({ message: 'El slug del negocio ya está en uso.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          giro: giro || 'Barbería',
        },
      });

      const user = await tx.user.create({
        data: {
          username,
          passwordHash,
          telefono,
          role: 'ADMIN',
          businessId: business.id,
        },
      });
      
      // Create default settings
      await tx.businessSetting.createMany({
        data: [
            { key: 'businessName', value: businessName, businessId: business.id },
            { key: 'businessPhone', value: telefono || '', businessId: business.id },
            { key: 'businessAddress', value: '', businessId: business.id },
            { key: 'whatsappSender', value: '', businessId: business.id },
        ]
      });

      return { business, user };
    });

    const token = signToken({ 
        sub: result.user.id, 
        role: result.user.role, 
        username: result.user.username,
        businessId: result.business.id 
    });

    res.status(201).json({
      token,
      user: serializeUser({ ...result.user, business: result.business }),
    });

  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ 
        where: { username }, 
        include: { barbero: true, business: true } 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signToken({ 
        sub: user.id, 
        role: user.role, 
        username: user.username,
        businessId: user.businessId
    });

    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
        where: { id: req.user.id }, 
        include: { barbero: true, business: true } 
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

export default router;
