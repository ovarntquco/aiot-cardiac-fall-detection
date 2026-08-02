import { Router } from "express";
import validate from "../middleware/validate.js";
import { registerValidators, loginValidators } from "../validators/auth.validator.js";
import { register, login, refresh, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;