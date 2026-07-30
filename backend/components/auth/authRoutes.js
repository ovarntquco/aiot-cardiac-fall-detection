import { Router } from "express";
import { verifyRequest } from "./authMiddlewares";
import { verifyUser } from "./authControllers";

const authRouter = Router()

authRouter.post("/auth", verifyRequest, verifyUser);

export default authRouter;