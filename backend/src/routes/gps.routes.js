import { Router } from 'express';
import { getLocation } from '../controllers/gps.controller.js';
import { gpsValidator } from '../validators/gps.validator.js';
import { limiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';

const router = Router();

router.get('/view', gpsValidator, validate, limiter, getLocation);

export default router;