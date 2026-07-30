import { Router } from "express";
import { verifyRequest } from "./historyMiddlewares";
import { getHistory } from "./historyControllers";
import { authenticate } from "../auth/authUtils";

const historyRouter = Router()

historyRouter.get("/auth", [authenticate, verifyRequest], getHistory);

export default historyRouter;