import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Error de validación',
      errors: errors.array(),
    });
  }
  next();
};

export default validateRequest;
