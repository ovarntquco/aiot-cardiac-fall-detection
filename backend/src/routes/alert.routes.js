import { Router } from "express";
import accessControl from "../middleware/accessControl.js";
import attachAccount from "../middleware/attachAccount.js";
import authenticateJWT from "../middleware/authenticateJWT.js";
import getAlertsByAccountId from "../controllers/alert.controller.js";

const router = Router();

router.get("/", authenticateJWT, attachAccount, accessControl, getAlertsByAccountId);

export default router;