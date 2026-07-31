import { body } from "express-validator";

export const alertValidator = [
  body("device_id").notEmpty().withMessage("Device Id must not be empty")
];