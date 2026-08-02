import { body } from "express-validator";

export const createDeviceValidators = [
  body("patientAccountId")
    .trim()
    .notEmpty()
    .withMessage("patientAccountId must not be empty")
    .isUUID()
    .withMessage("patientAccountId must be a valid UUID"),
];
