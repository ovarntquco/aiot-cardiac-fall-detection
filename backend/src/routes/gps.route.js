import { Router } from 'express';
import { gpsValidator } from '../validators/gps.validator.js';
import validate from '../middleware/validate.js';
import { getLocation } from '../controllers/gps.controller.js';

const router = Router();

router.post('/view', registerValidators, validate, getLocation);

export default router;