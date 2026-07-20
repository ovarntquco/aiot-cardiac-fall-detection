import { Router } from "express";
import { authenticate } from "../auth/authUtils";
import { verifyRequest } from "./homeMiddlewares";
import { getDeviceData } from "./homeControllers";

const homeRouter = Router();

homeRouter.get("/home", [authenticate, verifyRequest], getDeviceData);

export default homeRouter;