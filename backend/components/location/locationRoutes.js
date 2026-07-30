import { Router } from "express";
import { authenticate } from "../auth/authUtils";
import { verifyRequest } from "./locationMiddlewares";
import { getLocation } from "./locationControllers";

const locationRouter = Router();

locationRouter.get("/location", [authenticate, verifyRequest], getLocation);

export default locationRouter;