export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
};

const PRISMA_MESSAGES = {
  P2000: 'El valor ingresado es demasiado largo para este campo.',
  P2001: 'El registro solicitado no existe.',
  P2002: 'Ya existe un registro con ese valor único.',
  P2003: 'Error de referencia: el registro relacionado no existe.',
  P2004: 'Error de restricción en la base de datos.',
  P2005: 'El valor ingresado no es válido para este campo.',
  P2006: 'Valor inválido para el campo.',
  P2011: 'El campo no puede estar vacío.',
  P2012: 'Falta un campo requerido.',
  P2014: 'El cambio violaría una relación requerida.',
  P2015: 'No se encontró el registro relacionado.',
  P2021: 'La base de datos requiere una migración. Contacta al administrador.',
  P2025: 'El registro no existe o ya fue eliminado.',
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.code || '', err.message?.slice(0, 200));

  // Prisma known errors
  if (err.code?.startsWith('P')) {
    const friendly = PRISMA_MESSAGES[err.code] || 'Error en la base de datos. Intenta de nuevo.';
    return res.status(400).json({ message: friendly });
  }

  // Prisma unknown/internal errors (no code but message contains Prisma internals)
  if (err.message?.includes('prisma') || err.message?.includes('Prisma') || err.message?.includes('Invalid `prisma')) {
    return res.status(500).json({ message: 'Error interno del servidor. Intenta de nuevo.' });
  }

  const status = err.status || 500;
  const message = status >= 500
    ? 'Error interno del servidor.'
    : (err.message || 'Algo salió mal.');

  res.status(status).json({ message, details: err.details || null });
};
