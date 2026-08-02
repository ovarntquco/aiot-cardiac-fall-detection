import { body } from "express-validator";

export const registerValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email must not be empty")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("password must not be empty")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("role must not be empty")
    .isIn(["patient", "caregiver"])
    .withMessage("role must be patient or caregiver"),
];

export const loginValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email must not be empty")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("password must not be empty"),
];
