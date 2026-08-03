import { Router } from "express";
import getLatestLocation from "../controllers/gps.controller.js";
import attachAccount from "../middleware/attachAccount.js";
import authenticateJWT from "../middleware/authenticateJWT.js";

const router = Router();

router.get("/", authenticateJWT, attachAccount, getLatestLocation);

export default router;
