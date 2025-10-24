export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    details: err.details || null,
  });
};
