import { body, param, query } from 'express-validator';

export const createAppointmentValidator = [
  body('barberoId').isInt().withMessage('barberoId es requerido'),
  body('servicioId').isInt().withMessage('servicioId es requerido'),
  body('cliente').isString().trim().notEmpty().withMessage('cliente es requerido'),
  body('telefono').isString().trim().notEmpty().withMessage('telefono es requerido'),
  body('fecha')
    .isISO8601({ strict: true })
    .withMessage('fecha debe tener formato YYYY-MM-DD'),
  body('hora')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('hora debe tener formato HH:mm'),
];

export const barberoIdParamValidator = [
  param('barberoId').optional().isInt().withMessage('barberoId debe ser numérico'),
];

export const availabilityQueryValidator = [
  query('fecha')
    .isISO8601({ strict: true })
    .withMessage('fecha es requerida en formato YYYY-MM-DD'),
  query('servicioId').optional().isInt().withMessage('servicioId debe ser numérico'),
];

export const updateAppointmentValidator = [
  param('id').isInt().withMessage('id debe ser numérico'),
  body('estado').optional().isString(),
  body('fecha').optional().isISO8601({ strict: true }),
  body('hora').optional().matches(/^\d{2}:\d{2}$/),
];
