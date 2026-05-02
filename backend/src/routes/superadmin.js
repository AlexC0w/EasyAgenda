import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('SUPERADMIN'));

const PLATFORM_SLUG = 'platform';

const businessStats = async (businessId) => {
  const [users, servicios, citas] = await Promise.all([
    prisma.user.count({ where: { businessId, role: { not: 'SUPERADMIN' } } }),
    prisma.servicio.count({ where: { businessId } }),
    prisma.cita.groupBy({
      by: ['estado'],
      where: { businessId },
      _count: { id: true },
    }),
  ]);

  const citasByStatus = Object.fromEntries(citas.map((c) => [c.estado, c._count.id]));
  return {
    totalUsuarios: users,
    totalServicios: servicios,
    totalCitas: citas.reduce((sum, c) => sum + c._count.id, 0),
    citasConfirmadas: citasByStatus['confirmada'] || 0,
    citasPendientes: citasByStatus['pendiente'] || 0,
    citasCanceladas: citasByStatus['cancelada'] || 0,
  };
};

// GET /superadmin/superadmins — list all superadmin users
router.get('/superadmins', async (req, res, next) => {
  try {
    const superadmins = await prisma.user.findMany({
      where: { role: 'SUPERADMIN' },
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    });
    res.json(superadmins);
  } catch (error) {
    next(error);
  }
});

// GET /superadmin/businesses — list businesses visible to this superadmin
router.get('/businesses', async (req, res, next) => {
  try {
    const where = { slug: { not: PLATFORM_SLUG } };
    if (!req.user.isMasterSuperAdmin) {
      where.OR = [
        { assignedSuperAdminId: null },
        { assignedSuperAdminId: req.user.id },
      ];
    }
    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(
      businesses.map(async (b) => ({
        ...b,
        stats: await businessStats(b.id),
      }))
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /superadmin/businesses/:id — detail
router.get('/businesses/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return res.status(404).json({ message: 'Negocio no encontrado' });

    const [settings, admins, stats] = await Promise.all([
      prisma.businessSetting.findMany({ where: { businessId: id } }),
      prisma.user.findMany({
        where: { businessId: id, role: 'ADMIN' },
        select: { id: true, username: true, telefono: true, createdAt: true },
      }),
      businessStats(id),
    ]);

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({ ...business, settings: settingsMap, admins, stats });
  } catch (error) {
    next(error);
  }
});

// POST /superadmin/businesses — create new business
router.post('/businesses', async (req, res, next) => {
  try {
    const { businessName, slug, giro, adminUsername, adminPassword, adminTelefono } = req.body;
    if (!businessName || !slug || !adminUsername || !adminPassword) {
      return res.status(400).json({ message: 'businessName, slug, adminUsername y adminPassword son requeridos.' });
    }

    const hash = await bcrypt.hash(adminPassword, 10);

    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug: slug.toLowerCase().trim(),
        giro: giro || 'Barbería',
        status: 'ACTIVE',
        assignedSuperAdminId: req.user.id,
        users: {
          create: {
            username: adminUsername,
            passwordHash: hash,
            passwordPlain: adminPassword,
            telefono: adminTelefono || null,
            role: 'ADMIN',
          },
        },
        settings: {
          create: [
            { key: 'businessName', value: businessName },
            { key: 'businessPhone', value: '' },
            { key: 'businessAddress', value: '' },
            { key: 'whatsappSender', value: '' },
            { key: 'whatsappToken', value: '' },
          ],
        },
      },
      include: { users: true },
    });

    const stats = await businessStats(business.id);
    res.status(201).json({ ...business, stats });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El slug o usuario ya está en uso.' });
    }
    next(error);
  }
});

// PATCH /superadmin/businesses/:id — edit name/slug/giro/assignedSuperAdminId
router.patch('/businesses/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, slug, giro, assignedSuperAdminId } = req.body;

    const data = {};
    if (name) data.name = name;
    if (slug) data.slug = slug.toLowerCase().trim();
    if (giro) data.giro = giro;
    if (assignedSuperAdminId !== undefined) {
      data.assignedSuperAdminId = assignedSuperAdminId === null ? null : Number(assignedSuperAdminId);
    }

    const business = await prisma.business.update({ where: { id }, data });
    res.json(business);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Negocio no encontrado' });
    next(error);
  }
});

// PATCH /superadmin/businesses/:id/status — suspend/activate
router.patch('/businesses/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Status debe ser ACTIVE o SUSPENDED.' });
    }
    const business = await prisma.business.update({ where: { id }, data: { status } });
    res.json(business);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Negocio no encontrado' });
    next(error);
  }
});

// PATCH /superadmin/businesses/:id/reset-password — reset admin password
router.patch('/businesses/:id/reset-password', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const admin = await prisma.user.findFirst({ where: { businessId: id, role: 'ADMIN' } });
    if (!admin) return res.status(404).json({ message: 'No se encontró admin para este negocio.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: hash, passwordPlain: newPassword },
    });

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
});

// PATCH /superadmin/businesses/:id/settings — update business settings
router.patch('/businesses/:id/settings', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const entries = Object.entries(req.body);
    if (!entries.length) return res.status(400).json({ message: 'No se enviaron configuraciones.' });

    await Promise.all(
      entries.map(([key, value]) =>
        prisma.businessSetting.upsert({
          where: { businessId_key: { businessId: id, key } },
          update: { value: String(value) },
          create: { businessId: id, key, value: String(value) },
        })
      )
    );

    const settings = await prisma.businessSetting.findMany({ where: { businessId: id } });
    res.json(Object.fromEntries(settings.map((s) => [s.key, s.value])));
  } catch (error) {
    next(error);
  }
});

export default router;
