import { Router } from "express";
import validate from "../middleware/validate.js";
import { createDeviceValidators } from "../validators/device.validator.js";
import { createDevice } from "../controllers/device.controller.js";

const router = Router();

router.post("/create", createDeviceValidators, validate, createDevice);

export default router;