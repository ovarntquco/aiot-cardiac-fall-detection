import { Router } from "express";
import authenticateJWT from "../middleware/authenticateJWT.js";
import attachAccount from "../middleware/attachAccount.js";
import validate from "../middleware/validate.js";
import {
  createAccountValidators,
  assignCaregiverValidators,
  updateVitalsThresholdsValidators,
} from "../validators/account.validator.js";
import {
  createAccount,
  getMyAccount,
  getAllPatientAccounts,
  assignCaregiver,
  updateVitalsThresholds,
} from "../controllers/account.controller.js";

const router = Router();

router.post("/create", authenticateJWT, createAccountValidators, validate, createAccount);

router.get("/", authenticateJWT, attachAccount, getMyAccount);
router.get("/patients", authenticateJWT, attachAccount, getAllPatientAccounts);

router.patch("/caregiver", authenticateJWT, attachAccount, assignCaregiverValidators, validate, assignCaregiver);
router.patch("/vitals/:patientAccountId", authenticateJWT, attachAccount, updateVitalsThresholdsValidators, validate, updateVitalsThresholds);

export default router;