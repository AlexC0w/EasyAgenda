import prisma from '../lib/prisma.js';
import { verifyToken } from '../lib/jwt.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const barbero = await prisma.barbero.findFirst({ where: { userId: user.id } });

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      telefono: user.telefono,
      businessId: user.businessId,
      barberoId: barbero?.id || null,
      businessStatus: user.business.status,
    };

    if (user.business.status === 'SUSPENDED') {
      return res.status(403).json({ 
        message: 'Servicio Suspendido', 
        code: 'ACCOUNT_SUSPENDED',
        businessId: user.businessId 
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user) {
      const barbero = await prisma.barbero.findFirst({ where: { userId: user.id } });
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        telefono: user.telefono,
        businessId: user.businessId,
        barberoId: barbero?.id || null,
      };
    }
    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  next();
};
