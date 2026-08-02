import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import accountRoutes from "./routes/account.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import authRoutes from "./routes/auth.routes.js";
import deviceRoutes from "./routes/device.routes.js";

import initMqttRouter from "./services/mqtt/services.js";

const app = express();

initMqttRouter();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/account", accountRoutes);
app.use("/api/alert", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);

export default app;
