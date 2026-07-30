import { body } from 'express-validator';

export const createDeviceValidators = [
  body('patientAccountId').isUUID().withMessage('Patient account id must be a valid id'),
];