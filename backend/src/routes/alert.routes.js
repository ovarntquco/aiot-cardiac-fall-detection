import { Router } from "express";
import authenticateJWT from "../middleware/authenticateJWT.js";
import attachAccount from "../middleware/attachAccount.js";
import getAlertsByAccountId from "../controllers/alert.controller.js";

const router = Router();

router.get("/", authenticateJWT, attachAccount, getAlertsByAccountId);

export default router;