import { body } from "express-validator";

export const createAccountValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name must not be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("dateOfBirth")
    .isDate()
    .withMessage("Date of birth must be a valid date")
    .custion((value) => {
      const dob = new Date(value);
      const now = new Date();

      if (dob >= now) {
        throw new Error("Date of birth must be in the past");
      }

      return true;
    }),

  body("sex")
    .isIn(["male", "female"])
    .withMessage("Sex must be male or female"),

  body("height")
    .isInt({ min: 30, max: 300 })
    .withMessage("Height must be between 30 and 300 cm"),

  body("weight")
    .isInt({ min: 1, max: 500 })
    .withMessage("Weight must be between 1 and 500 kg"),
];

export const assignCaregiverValidators = [
  body("caregiverAccountId")
    .trim()
    .notEmpty("Caregiver account Id must not be empty")
    .isUUID()
    .withMessage("Caregiver account Id must be a valid UUID"),
];

export const updateVitalsThresholdsValidators = [
  body("hrLow")
    .optional()
    .isInt({ min: 50, max: 100 })
    .withMessage("Low heart rate threshold must be between 50 and 100"),

  body("hrHigh")
    .optional()
    .isInt({ min: 100, max: 150 })
    .withMessage("High heart rate threshold must be between 100 and 150"),
    
  body("spo2Low")
    .optional()
    .isInt({ min: 80, max: 100 })
    .withMessage("Low SpO2 threshold must be between 80 and 100"),
];
