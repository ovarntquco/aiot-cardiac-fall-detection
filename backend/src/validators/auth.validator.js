import { body } from 'express-validator';

export const registerValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['patient', 'caregiver']).withMessage('Role must be patient or caregiver'),
];

export const loginValidators = [
  body('email').notEmpty().withMessage('Email must not be empty'),
  body('password').notEmpty().withMessage('Password must not be empty')
];