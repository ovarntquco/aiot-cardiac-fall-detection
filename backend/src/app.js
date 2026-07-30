import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import deviceRoutes from './routes/device.routes.js';
<<<<<<< HEAD
=======
import gpsRoute from './routes/device.routes.js'
>>>>>>> b1707b4413818e797312e58af84f9c8f6db5db64

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/device', deviceRoutes);
<<<<<<< HEAD
=======
app.use('/api/gps', gpsRoute);
>>>>>>> b1707b4413818e797312e58af84f9c8f6db5db64

export default app;