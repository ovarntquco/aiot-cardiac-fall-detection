import { body } from "express-validator";

export const createAccountValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("fullName must not be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("fullName must be between 2 and 100 characters"),

  body("dateOfBirth")
    .isDate()
    .withMessage("dateOfBirth must be a valid date")
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();

      if (dob >= now) {
        throw new Error("dateOfBirth must be in the past");
      }

      return true;
    }),

  body("sex")
    .isIn(["male", "female"])
    .withMessage("sex must be male or female"),

  body("height")
    .isInt({ min: 30, max: 300 })
    .withMessage("height must be between 30 and 300 cm"),

  body("weight")
    .isInt({ min: 1, max: 500 })
    .withMessage("weight must be between 1 and 500 kg"),
];

export const assignCaregiverValidators = [
  body("caregiverAccountId")
    .trim()
    .notEmpty("caregiverAccountId must not be empty")
    .isUUID()
    .withMessage("caregiverAccountId must be a valid UUID"),
];

export const updateVitalsThresholdsValidators = [
  body("hrLow")
    .optional()
    .isInt({ min: 60, max: 90 })
    .withMessage("hrLow threshold must be between 50 and 100"),

  body("hrHigh")
    .optional()
    .isInt({ min: 100, max: 190 })
    .withMessage("hrHigh threshold must be between 100 and 150"),
    
  body("spo2Low")
    .optional()
    .isInt({ min: 80, max: 100 })
    .withMessage("spo2Low threshold must be between 80 and 100"),
];
