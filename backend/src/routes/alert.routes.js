import { Router } from "express";
import { alertValidator } from "../validators/alert.validator";
import validate from "../middleware/validate";
import { getAlerts } from "../controllers/alert.controller";

const router = Router();

router.get("/view", alertValidator, validate, getAlerts);

export default router;