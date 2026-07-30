import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import deviceRoutes from './routes/device.routes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/device', deviceRoutes);

export default app;