import { Router } from "express";
import getOverview from "../controllers/overview.controller.js";
import accessControl from "../middleware/accessControl.js";
import attachAccount from "../middleware/attachAccount.js";
import authenticateJWT from "../middleware/authenticateJWT.js";

const router = Router();

router.get("/", authenticateJWT, attachAccount, accessControl, getOverview);

export default router;
