export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 'P2021') {
    return res.status(500).json({
      message:
        'La base de datos no tiene las tablas más recientes. Ejecuta `npx prisma migrate deploy` o el script `npm run prisma:migrate` para aplicar las migraciones.',
      details: err.meta ?? null,
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    details: err.details || null,
  });
};
