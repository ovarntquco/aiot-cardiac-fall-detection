import { Router } from "express";
import getOverview from "../controllers/overview.controller.js";
import attachAccount from "../middleware/attachAccount.js";
import authenticateJWT from "../middleware/authenticateJWT.js";

const router = Router();

router.get("/", authenticateJWT, attachAccount, getOverview);

export default router;
