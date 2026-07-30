import { body } from 'express-validator';

export const gpsValidator = [
  body('device_id').notEmpty().withMessage('Device Id must not be empty')
];