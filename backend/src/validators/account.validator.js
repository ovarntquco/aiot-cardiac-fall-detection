import { body } from 'express-validator';

export const createAccountValidators = [
  body('fullName').notEmpty().withMessage('Full name must not be empty'),
  body('dateOfBirth').isDate().withMessage('Date of birth must be date'),
  body('sex').isIn(['male', 'female']).withMessage('Sex must be male or female'),
  body('height').isInt({ min: 1.0 }).withMessage('Height must be greater than 0'),
  body('weight').isInt({ min: 1.0 }).withMessage('Weight must be greater than 0'),
];

export const assignCaregiverValidators = [
  body('caregiverAccountId').isUUID().withMessage('Caregiver id must be a valid id'),
];

export const updateVitalsThresholdsValidators = [
  body('hrLow').optional().isInt({ min: 50, max: 100 }).withMessage('Low heart rate threshold must be between 50 and 100'),
  body('hrHigh').optional().isInt({ min: 100, max: 150 }).withMessage('High heart rate threshold must be between 100 and 150'),
  body('spo2Low').optional().isInt({ min: 80, max: 100 }).withMessage('Low SpO2 threshold must be between 80 and 100'),
];