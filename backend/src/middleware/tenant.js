import prisma from '../lib/prisma.js';

export const resolveTenant = async (req, res, next) => {
  // 1. Try to get slug from params (e.g. /api/:slug/barberos)
  // Note: This requires routes to be defined like router.use('/:slug/barberos', ...)
  // OR we can pass it in headers/query for simplicity in some cases.
  // But for the booking flow, the frontend will likely call /api/barberos?slug=demo OR /api/:slug/barberos
  
  // Let's support query param 'slug' for public endpoints for now as it's easiest to integrate without changing all route paths immediately.
  // Or better, let's assume the frontend sends 'X-Tenant-Slug' header or we use a route param.
  
  // Strategy:
  // If user is authenticated, we trust req.user.businessId (already set by authenticate middleware).
  // If public, we look for 'slug' in query or 'x-tenant-slug' header.

  if (req.user && req.user.businessId) {
    req.businessId = req.user.businessId;
    return next();
  }

  console.log('resolveTenant:', { url: req.url, query: req.query, headers: req.headers['x-tenant-slug'], bodySlug: req.body?.slug });
  const slug = req.query.slug || req.headers['x-tenant-slug'] || req.body?.slug;

  if (!slug) {
    // If no slug provided for public route, we can't resolve tenant.
    // Some routes might not need it (like health check), but most will.
    // We'll let the route handler decide if it's critical, or return 400 here.
    // For now, let's attach null and let controllers handle it or fail.
    req.businessId = null;
    return next();
  }

  try {
    const business = await prisma.business.findUnique({
      where: { slug: String(slug) },
    });

    if (!business) {
      return res.status(404).json({ message: 'Negocio no encontrado.' });
    }

    req.businessId = business.id;
    req.businessId = business.id;
    
    if (business.status === 'SUSPENDED') {
       return res.status(403).json({ 
        message: 'Servicio Suspendido', 
        code: 'ACCOUNT_SUSPENDED',
        businessId: business.id 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
